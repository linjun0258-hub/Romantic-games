// Creem 支付集成（零 npm 依赖）：API 客户端 + Webhook 验签 + Premium 会员权益
// 规范依据：https://creem.io/SKILL.md 与 docs.creem.io
// - 测试基址 https://test-api.creem.io（creem_test_ 前缀密钥），认证头 x-api-key
// - 创建 Checkout：POST /v1/checkouts { product_id, request_id, success_url, metadata }
// - Webhook 签名：creem-signature 头 = HMAC-SHA256(rawBody, webhookSecret) 的小写 hex
// - 价格单位为美分；Checkout metadata 会随事件回传（referenceId 用于映射站内用户）
import { sql } from "./db.ts";

const API_KEY = Deno.env.get("CREEM_API_KEY") ?? "";
const PRODUCT_ID = Deno.env.get("CREEM_PRODUCT_ID") ?? "";
const WEBHOOK_SECRET = Deno.env.get("CREEM_WEBHOOK_SECRET") ?? "";

// 按密钥前缀自动选择环境：creem_test_ → 测试，其余 → 生产
export const creemApiBase = API_KEY.startsWith("creem_test_")
  ? "https://test-api.creem.io"
  : "https://api.creem.io";

export function creemConfigured(): boolean {
  return API_KEY !== "" && PRODUCT_ID !== "";
}

export interface CreateCheckoutOptions {
  requestId: string;
  successUrl: string;
  metadata: Record<string, string>;
}

/** 创建 Creem 托管收银台会话，返回 checkout_url */
export async function createCheckout(
  opts: CreateCheckoutOptions,
): Promise<string> {
  const res = await fetch(`${creemApiBase}/v1/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      product_id: PRODUCT_ID,
      request_id: opts.requestId,
      success_url: opts.successUrl,
      metadata: opts.metadata,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`creem checkout ${res.status}: ${detail}`);
  }
  const data = await res.json();
  const url = data?.checkout_url;
  if (typeof url !== "string" || url === "") {
    throw new Error("creem checkout: missing checkout_url");
  }
  return url;
}

/** 校验 Webhook 签名（HMAC-SHA256 hex 小写，常量时间比较防时序攻击） */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  if (WEBHOOK_SECRET === "" || !signature) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

// ---------- Premium 会员权益（Neon Postgres） ----------

export interface Entitlement {
  username: string;
  status: string; // active | inactive
  subscriptionId: string | null;
  customerEmail: string | null;
  updatedAt: string;
}

let tablesReady = false;
async function ensureCreemTables(): Promise<void> {
  if (tablesReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS premium_entitlements (
      username TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      subscription_id TEXT,
      customer_email TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS creem_webhook_events (
      event_id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  tablesReady = true;
}

/** 授予/恢复会员（checkout 完成或订阅生效时调用） */
export async function grantPremium(
  username: string,
  subscriptionId: string | null,
  customerEmail: string | null,
): Promise<void> {
  await ensureCreemTables();
  await sql`
    INSERT INTO premium_entitlements (username, status, subscription_id, customer_email, updated_at)
    VALUES (${username}, 'active', ${subscriptionId}, ${customerEmail}, NOW())
    ON CONFLICT (username) DO UPDATE
    SET status = 'active', subscription_id = EXCLUDED.subscription_id,
        customer_email = EXCLUDED.customer_email, updated_at = NOW()
  `;
}

/** 撤销会员（订阅取消/过期/暂停时调用） */
export async function revokePremium(username: string): Promise<void> {
  await ensureCreemTables();
  await sql`
    INSERT INTO premium_entitlements (username, status, subscription_id, customer_email, updated_at)
    VALUES (${username}, 'inactive', NULL, NULL, NOW())
    ON CONFLICT (username) DO UPDATE
    SET status = 'inactive', subscription_id = NULL,
        customer_email = NULL, updated_at = NOW()
  `;
}

/** 查询会员状态（未开通返回 null） */
export async function getPremiumStatus(
  username: string,
): Promise<Entitlement | null> {
  await ensureCreemTables();
  const rows = await sql`
    SELECT username, status, subscription_id, customer_email, updated_at
    FROM premium_entitlements
    WHERE username = ${username}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    username: String(row.username),
    status: String(row.status),
    subscriptionId: row.subscription_id == null ? null : String(row.subscription_id),
    customerEmail: row.customer_email == null ? null : String(row.customer_email),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

/** 记录 Webhook 事件（幂等）；返回 true=首次接收，false=重复投递 */
export async function recordWebhookEvent(
  eventId: string,
  eventType: string,
): Promise<boolean> {
  await ensureCreemTables();
  const rows = await sql`
    INSERT INTO creem_webhook_events (event_id, event_type)
    VALUES (${eventId}, ${eventType})
    ON CONFLICT (event_id) DO NOTHING
    RETURNING event_id
  `;
  return rows.length > 0;
}
