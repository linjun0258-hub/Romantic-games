// 密码重置模块：邮箱一次性验证码
// 设计要点：
//   1. 只存验证码的 SHA-256 哈希（绑定邮箱 + SESSION_SECRET），数据库泄露也无法直接使用
//   2. 一次性：校验通过立即标记 used，防重放
//   3. 10 分钟过期；同一验证码最多尝试 5 次，防止 6 位码被暴力枚举
//   4. 新码签发时作废该邮箱所有旧码，保证只有最新一封邮件有效
//   5. 发信结果必须回传给调用方，禁止“发信失败也显示已发送”的静默失败
import { sql } from "./db.ts";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { hashPassword } from "./userAuth.ts";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

let initialized = false;

// 建表（幂等，可安全重复调用）
export async function ensureResetTable(): Promise<void> {
  if (initialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code_hash VARCHAR(128) NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_reset_codes_email
      ON password_reset_codes (email, used)
    `;
    initialized = true;
  } catch (err) {
    initialized = false; // 失败允许下次重试
    throw err;
  }
}

// 验证码哈希：绑定邮箱，避免同一码在任意邮箱通用
function hashCode(email: string, code: string): string {
  const secret = Deno.env.get("SESSION_SECRET") ?? "dev-secret-change-me";
  return createHash("sha256").update(`${email}:${code}:${secret}`).digest("hex");
}

export function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

// 大小写不敏感地按邮箱查用户（注册时可能保留了原始大小写）
export async function findUserByEmailCI(email: string) {
  const normalized = email.trim().toLowerCase();
  const rows = await sql`
    SELECT id, username, email FROM users
    WHERE LOWER(email) = ${normalized} LIMIT 1
  `;
  return rows[0] ?? null;
}

// 签发验证码，返回明文（仅用于发信，不落库）
export async function issueResetCode(email: string): Promise<string> {
  await ensureResetTable();
  const normalized = email.trim().toLowerCase();

  await sql`
    UPDATE password_reset_codes SET used = TRUE
    WHERE email = ${normalized} AND used = FALSE
  `;

  const code = generateCode();
  await sql`
    INSERT INTO password_reset_codes (email, code_hash, expires_at)
    VALUES (
      ${normalized},
      ${hashCode(normalized, code)},
      NOW() + make_interval(mins => ${CODE_TTL_MINUTES})
    )
  `;
  return code;
}

export type ConsumeResult = "ok" | "invalid" | "expired" | "too_many";

// 校验并消费验证码
export async function consumeResetCode(
  email: string,
  code: string,
): Promise<ConsumeResult> {
  await ensureResetTable();
  const normalized = email.trim().toLowerCase();

  const rows = await sql`
    SELECT id, code_hash, attempts, expires_at
    FROM password_reset_codes
    WHERE email = ${normalized} AND used = FALSE
    ORDER BY id DESC
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return "invalid";

  if (Number(row.attempts) >= MAX_ATTEMPTS) return "too_many";
  if (new Date(row.expires_at).getTime() < Date.now()) return "expired";

  const expected = Buffer.from(hashCode(normalized, code), "hex");
  const actual = Buffer.from(String(row.code_hash), "hex");
  const matched = expected.length === actual.length &&
    timingSafeEqual(expected, actual);

  if (!matched) {
    await sql`
      UPDATE password_reset_codes SET attempts = attempts + 1 WHERE id = ${row.id}
    `;
    return "invalid";
  }

  // 一次性消费，防重放
  await sql`UPDATE password_reset_codes SET used = TRUE WHERE id = ${row.id}`;
  return "ok";
}

// 更新密码：users 表（用户名登录）+ better-auth account 表（credential 凭据）必须同步
export async function updatePasswordByEmail(
  email: string,
  plainPassword: string,
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const hash = await hashPassword(plainPassword);

  const updated = await sql`
    UPDATE users SET password = ${hash}
    WHERE LOWER(email) = ${normalized}
    RETURNING id
  `;

  await sql`
    UPDATE "account"
    SET "password" = ${hash}, "updatedAt" = NOW()
    WHERE "providerId" = 'credential' AND LOWER("accountId") = ${normalized}
  `;

  return updated.length > 0;
}

// ---------- 发信（复用既有 Resend 配置），必须返回可判定的结果 ----------

export interface MailResult {
  ok: boolean;
  status?: number;
  /** Resend 返回的错误正文，仅用于服务端日志/诊断，勿直接展示给终端用户 */
  detail?: string;
  /** missing_api_key | resend_rejected | network */
  reason?: "missing_api_key" | "resend_rejected" | "network";
}

// 实际发信的发件人。未配置 MAIL_FROM 时退回 Resend 沙箱地址，
// 该地址只能发给 Resend 账号所有者本人，务必在 Vercel 配置自有域名地址。
export function mailFromAddress(): string {
  const v = Deno.env.get("MAIL_FROM")?.trim();
  return v && v.length > 0 ? v : "Couple Game <onboarding@resend.dev>";
}

async function sendMail(
  email: string,
  subject: string,
  html: string,
): Promise<MailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY")?.trim();
  if (!apiKey) {
    console.error("[password-reset] 缺少 RESEND_API_KEY，无法发送邮件");
    return { ok: false, reason: "missing_api_key" };
  }

  const from = mailFromAddress();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html,
      }),
    });

    // 必须读出正文，Resend 的失败原因（域名未验证 / 收件人不允许）都在里面
    const text = await res.text().catch(() => "");

    if (!res.ok) {
      console.error(
        `[password-reset] 发信失败 status=${res.status} from="${from}" to="${email}" body=${text.slice(0, 500)}`,
      );
      return {
        ok: false,
        status: res.status,
        detail: text.slice(0, 300),
        reason: "resend_rejected",
      };
    }

    console.log(`[password-reset] 发信成功 status=${res.status} from="${from}"`);
    return { ok: true, status: res.status };
  } catch (err) {
    console.error("[password-reset] 发信异常", err);
    return { ok: false, reason: "network" };
  }
}

// 发送重置验证码邮件
export async function sendResetMail(
  email: string,
  code: string,
): Promise<MailResult> {
  return await sendMail(
    email,
    "密码重置验证码",
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>重置你的登录密码</h2>
      <p>你正在重置密码，本次验证码为：</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#db2777">${code}</p>
      <p>验证码 <strong>${CODE_TTL_MINUTES} 分钟内</strong>有效，仅可使用一次。</p>
      <p style="color:#999;font-size:12px">如果这不是你本人的操作，请忽略本邮件，你的密码不会被更改。</p>
    </div>`,
  );
}

// 发送“用户名提醒”邮件：用于同时忘记用户名和密码的场景
export async function sendUsernameMail(
  email: string,
  username: string,
): Promise<MailResult> {
  return await sendMail(
    email,
    "你的登录用户名",
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>你的登录用户名</h2>
      <p>你在情侣飞行棋的登录用户名是：</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:2px;color:#db2777">${username}</p>
      <p>如果密码也忘记了，可以直接到
        <a href="https://couples-game.website/forgot">找回密码</a>页，
        用这个邮箱收验证码重置密码，不需要输入用户名。
      </p>
      <p style="color:#999;font-size:12px">如果这不是你本人的操作，请忽略本邮件。</p>
    </div>`,
  );
}
