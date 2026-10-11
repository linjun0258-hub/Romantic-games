// Creem Webhook 接收端：POST /api/creem/webhook
// 验证 creem-signature 头（HMAC-SHA256(rawBody, CREEM_WEBHOOK_SECRET) 的小写 hex）
// 幂等：按事件 ID 去重（creem_webhook_events 表），重复投递直接返回 200
// 授权事件：checkout.completed / subscription.active / subscription.paid / subscription.trialing
// 撤权事件：subscription.canceled / subscription.expired / subscription.paused
// 其余事件（past_due / update 等）仅记录不改变权益
import { Handlers } from "$fresh/server.ts";
import {
  grantPremium,
  recordWebhookEvent,
  revokePremium,
  verifyWebhookSignature,
} from "../../../lib/creem.ts";

const GRANT_EVENTS = new Set([
  "checkout.completed",
  "subscription.active",
  "subscription.paid",
  "subscription.trialing",
]);

const REVOKE_EVENTS = new Set([
  "subscription.canceled",
  "subscription.expired",
  "subscription.paused",
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

export const handler: Handlers = {
  async POST(req) {
    const rawBody = await req.text();
    const signature = req.headers.get("creem-signature");
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
    const firstTime = await recordWebhookEvent(eventId, eventType);
    if (!firstTime) {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 解析站内用户名与订阅信息（checkout 与 subscription 事件都携带 metadata）
    const meta = obj.metadata ?? {};
    const username = typeof meta.referenceId === "string" ? meta.referenceId : "";
    const customerEmail = obj.customer?.email ?? obj.subscription?.customer?.email ??
      null;
    const subscriptionId = typeof obj.id === "string" && obj.id.startsWith("sub_")
      ? obj.id
      : obj.subscription?.id ?? null;

    if (username === "") {
      // 无法映射到站内用户：记录告警并确认，避免 Creem 无限重试
      console.warn("[creem-webhook] 事件缺少 referenceId", eventId, eventType);
      return new Response(JSON.stringify({ ok: true, unmapped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      if (GRANT_EVENTS.has(eventType)) {
        await grantPremium(username, subscriptionId, customerEmail);
      } else if (REVOKE_EVENTS.has(eventType)) {
        await revokePremium(username);
      }
    } catch (err) {
      console.error("[creem-webhook] 处理事件失败", eventId, eventType, err);
      return new Response("Handler error", { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
