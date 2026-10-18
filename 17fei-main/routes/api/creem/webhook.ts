// 支付 Webhook 接收端：POST /api/creem/webhook
//
// 双通道：同一个 URL 同时接收 Creem 与 Dodo Payments 的事件，按签名请求头自动识别。
//   - Creem：请求头 creem-signature = HMAC-SHA256(rawBody, CREEM_WEBHOOK_SECRET) 的小写 hex
//   - Dodo ：Standard Webhooks（webhook-id / webhook-timestamp / webhook-signature）
// 幂等：按事件 ID 去重（creem_webhook_events 表），重复投递直接返回 200
// 授权事件：Creem checkout.completed / subscription.active|paid|trialing
//           Dodo  payment.succeeded / subscription.active|renewed
// 撤权事件：Creem subscription.canceled|expired|paused / refund.created
//           Dodo  subscription.cancelled|expired|on_hold
// 其余事件仅记录，不改变权益
import { Handlers } from "$fresh/server.ts";
import {
  grantPremium,
  recordWebhookEvent,
  revokePremium,
  verifyWebhookSignature,
} from "../../../lib/creem.ts";
import { normalizeDodoEvent, verifyDodoSignature } from "../../../lib/dodo.ts";

const CREEM_GRANT_EVENTS = new Set([
  "checkout.completed",
  "subscription.active",
  "subscription.paid",
  "subscription.trialing",
]);

const CREEM_REVOKE_EVENTS = new Set([
  "subscription.canceled",
  "subscription.expired",
  "subscription.paused",
  "refund.created",
]);

interface CreemEventObject {
  id?: string;
  metadata?: Record<string, unknown>;
  customer?: { email?: string } | null;
  subscription?: { id?: string; customer?: { email?: string } | null } | null;
}

interface CreemEvent {
  id?: string;
  eventType?: string;
  object?: CreemEventObject;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Creem 通道 */
async function handleCreem(
  rawBody: string,
  signature: string | null,
): Promise<Response> {
  const valid = await verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: CreemEvent;
  try {
    event = JSON.parse(rawBody) as CreemEvent;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = event.eventType ?? "";
  const eventId = event.id ?? crypto.randomUUID();
  const obj: CreemEventObject = event.object ?? {};

  // 幂等：重复投递直接确认
  const firstTime = await recordWebhookEvent(eventId, `creem:${eventType}`);
  if (!firstTime) {
    return json({ ok: true, provider: "creem", duplicate: true });
  }

  // 解析站内用户名与订阅信息（checkout 与 subscription 事件都携带 metadata）
  const meta = obj.metadata ?? {};
  const username = typeof meta.referenceId === "string"
    ? meta.referenceId
    : "";
  const customerEmail = obj.customer?.email ??
    obj.subscription?.customer?.email ?? null;
  const subscriptionId = typeof obj.id === "string" &&
      obj.id.startsWith("sub_")
    ? obj.id
    : obj.subscription?.id ?? null;

  if (username === "") {
    // 无法映射到站内用户：记录告警并确认，避免上游无限重试
    console.warn("[payment-webhook] creem 事件缺少 referenceId", eventId, eventType);
    return json({ ok: true, provider: "creem", unmapped: true });
  }

  try {
    if (CREEM_GRANT_EVENTS.has(eventType)) {
      await grantPremium(username, subscriptionId, customerEmail);
    } else if (CREEM_REVOKE_EVENTS.has(eventType)) {
      await revokePremium(username);
    }
  } catch (err) {
    console.error("[payment-webhook] creem 处理失败", eventId, eventType, err);
    return new Response("Handler error", { status: 500 });
  }

  return json({ ok: true, provider: "creem" });
}

/** Dodo 通道 */
async function handleDodo(
  rawBody: string,
  headers: Headers,
): Promise<Response> {
  const valid = await verifyDodoSignature(rawBody, headers);
  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = normalizeDodoEvent(rawBody, headers);
  if (!event) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const firstTime = await recordWebhookEvent(
    event.eventId,
    `dodo:${event.eventType}`,
  );
  if (!firstTime) {
    return json({ ok: true, provider: "dodo", duplicate: true });
  }

  if (event.username === "") {
    console.warn(
      "[payment-webhook] dodo 事件缺少 referenceId",
      event.eventId,
      event.eventType,
    );
    return json({ ok: true, provider: "dodo", unmapped: true });
  }

  try {
    if (event.action === "grant") {
      await grantPremium(
        event.username,
        event.subscriptionId,
        event.customerEmail,
      );
    } else if (event.action === "revoke") {
      await revokePremium(event.username);
    }
  } catch (err) {
    console.error(
      "[payment-webhook] dodo 处理失败",
      event.eventId,
      event.eventType,
      err,
    );
    return new Response("Handler error", { status: 500 });
  }

  return json({ ok: true, provider: "dodo", action: event.action });
}

export const handler: Handlers = {
  async POST(req) {
    const rawBody = await req.text();

    // 按签名头判定发送方：Creem 用 creem-signature，Dodo 用 Standard Webhooks 三件套
    if (req.headers.get("creem-signature")) {
      return await handleCreem(rawBody, req.headers.get("creem-signature"));
    }
    if (req.headers.get("webhook-id")) {
      return await handleDodo(rawBody, req.headers);
    }
    return new Response("Invalid signature", { status: 401 });
  },
};
