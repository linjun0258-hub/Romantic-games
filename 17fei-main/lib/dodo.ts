// Dodo Payments 集成（零 npm 依赖）：API 客户端 + Webhook 验签 + 事件归一化
// 规范依据：docs.dodopayments.com（Webhooks / Checkout Sessions / API 参考）
// - 测试基址 https://test.dodopayments.com，正式 https://live.dodopayments.com
// - 认证头 Authorization: Bearer <DODO_PAYMENTS_API_KEY>
// - 创建收银台：POST /checkouts { product_cart, return_url, metadata }
// - Webhook 验签遵循 Standard Webhooks 规范：
//     signedContent = `${webhook-id}.${webhook-timestamp}.${rawBody}`
//     key = base64 解码后的密钥（去掉 whsec_ 前缀）
//     signature = base64(HMAC-SHA256(key, signedContent))，请求头 webhook-signature 形如 "v1,<base64>"
// - 事件体：{ business_id, type, timestamp, data }，metadata 位于 data.metadata
//   referenceId 与 Creem 通道保持一致，用于映射站内用户名

const API_KEY = Deno.env.get("DODO_PAYMENTS_API_KEY") ?? "";
const PRODUCT_ID = Deno.env.get("DODO_PRODUCT_ID") ?? "";
const WEBHOOK_SECRET = Deno.env.get("DODO_WEBHOOK_SECRET") ?? "";
const TEST_MODE_RAW = (Deno.env.get("DODO_TEST_MODE") ?? "true").toLowerCase();

/** 默认走测试环境；正式上线时把 DODO_TEST_MODE 设为 false */
export const dodoTestMode = TEST_MODE_RAW !== "false" && TEST_MODE_RAW !== "0";

export const dodoApiBase = dodoTestMode
  ? "https://test.dodopayments.com"
  : "https://live.dodopayments.com";

export function dodoConfigured(): boolean {
  return API_KEY !== "" && PRODUCT_ID !== "";
}

export interface DodoCheckoutOptions {
  requestId: string;
  successUrl: string;
  metadata: Record<string, string>;
}

/** 创建 Dodo 托管收银台会话，返回 checkout_url */
export async function createDodoCheckout(
  opts: DodoCheckoutOptions,
): Promise<string> {
  const metadata: Record<string, string> = { ...opts.metadata };
  if (metadata.requestId === undefined) {
    metadata.requestId = opts.requestId;
  }
  const res = await fetch(`${dodoApiBase}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      product_cart: [{ product_id: PRODUCT_ID, quantity: 1 }],
      return_url: opts.successUrl,
      metadata,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`dodo checkout ${res.status}: ${detail}`);
  }
  const data = await res.json() as Record<string, unknown>;
  const url = data?.checkout_url ?? data?.payment_link ?? data?.url;
  if (typeof url !== "string" || url === "") {
    throw new Error("dodo checkout: missing checkout_url");
  }
  return url;
}

// ---------- Webhook 验签（Standard Webhooks） ----------

/** 时间戳容差（秒），超出视为重放攻击 */
const TOLERANCE_SECONDS = 300;

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** 常量时间字符串比较，防时序攻击 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** 校验 Dodo Webhook 签名 */
export async function verifyDodoSignature(
  rawBody: string,
  headers: Headers,
): Promise<boolean> {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (WEBHOOK_SECRET === "" || !id || !timestamp || !signatureHeader) {
    return false;
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > TOLERANCE_SECONDS) return false;

  const secret = WEBHOOK_SECRET.startsWith("whsec_")
    ? WEBHOOK_SECRET.slice(6)
    : WEBHOOK_SECRET;

  let keyBytes: Uint8Array;
  try {
    keyBytes = base64ToBytes(secret);
  } catch {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent),
  );
  const expected = bytesToBase64(new Uint8Array(mac));

  // webhook-signature 可能是空格分隔的多个版本，逐个匹配
  for (const part of signatureHeader.split(" ")) {
    const trimmed = part.trim();
    if (trimmed === "") continue;
    const idx = trimmed.indexOf(",");
    if (idx < 0) continue;
    const version = trimmed.slice(0, idx);
    const sig = trimmed.slice(idx + 1);
    if (version !== "v1") continue;
    if (safeEqual(sig, expected)) return true;
  }
  return false;
}

// ---------- 事件归一化（与 Creem 通道统一为同一结构） ----------

export type PaymentAction = "grant" | "revoke" | "ignore";

/** 授权事件：付款成功 / 订阅生效 / 订阅续费成功 */
const DODO_GRANT_EVENTS = new Set([
  "payment.succeeded",
  "subscription.active",
  "subscription.renewed",
]);

/** 撤权事件：订阅取消 / 到期 / 续费失败挂起 */
const DODO_REVOKE_EVENTS = new Set([
  "subscription.cancelled",
  "subscription.expired",
  "subscription.on_hold",
]);

export interface NormalizedEvent {
  eventId: string;
  eventType: string;
  username: string;
  subscriptionId: string | null;
  customerEmail: string | null;
  action: PaymentAction;
}

/** 把 Dodo 事件体归一化为统一结构；JSON 非法时返回 null */
export function normalizeDodoEvent(
  rawBody: string,
  headers: Headers,
): NormalizedEvent | null {
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return null;
  }

  const eventType = typeof payload.type === "string" ? payload.type : "";
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const meta = (data.metadata ?? {}) as Record<string, unknown>;
  const referenceId = typeof meta.referenceId === "string" ? meta.referenceId : "";

  const customer = (data.customer ?? {}) as Record<string, unknown>;
  const email = typeof customer.email === "string" ? customer.email : null;

  // 付款事件的 data.id 是支付单号，只有 sub_ 前缀才是订阅号
  const candidate = data.subscription_id ?? data.id;
  const subscriptionId = typeof candidate === "string" &&
      candidate.startsWith("sub_")
    ? candidate
    : null;

  const action: PaymentAction = DODO_GRANT_EVENTS.has(eventType)
    ? "grant"
    : DODO_REVOKE_EVENTS.has(eventType)
    ? "revoke"
    : "ignore";

  const eventId = headers.get("webhook-id") ??
    `dodo_${eventType}_${String(payload.timestamp ?? "")}`;

  return {
    eventId,
    eventType,
    username: referenceId,
    subscriptionId,
    customerEmail: email,
    action,
  };
}
