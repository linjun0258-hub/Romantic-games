// 密码重置模块：邮箱一次性验证码
// 设计要点：
//   1. 只存验证码的 SHA-256 哈希（绑定邮箱 + SESSION_SECRET），数据库泄露也无法直接使用
//   2. 一次性：校验通过立即标记 used，防重放
//   3. 10 分钟过期；同一验证码最多尝试 5 次，防止 6 位码被暴力枚举
//   4. 新码签发时作废该邮箱所有旧码，保证只有最新一封邮件有效
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

// 发送验证码邮件（复用既有 Resend 配置）
export async function sendResetMail(
  email: string,
  code: string,
): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("MAIL_FROM") ??
    "Couple Game <onboarding@resend.dev>";
  if (!apiKey) {
    console.error("[password-reset] 缺少 RESEND_API_KEY，无法发送验证码");
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "密码重置验证码",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>重置你的登录密码</h2>
        <p>你正在重置密码，本次验证码为：</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#db2777">${code}</p>
        <p>验证码 <strong>${CODE_TTL_MINUTES} 分钟内</strong>有效，仅可使用一次。</p>
        <p style="color:#999;font-size:12px">如果这不是你本人的操作，请忽略本邮件，你的密码不会被更改。</p>
      </div>`,
    }),
  });

  if (!res.ok) {
    console.error(`[password-reset] 发信失败 ${res.status}: ${await res.text()}`);
  }
  return res.ok;
}
