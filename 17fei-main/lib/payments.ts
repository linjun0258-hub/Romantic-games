// 支付通道抽象层：在 Creem 与 Dodo Payments 之间可切换
//
// 环境变量：
//   PAYMENT_PROVIDER   creem | dodo | auto（默认 auto）
//                      auto 规则：配置了 Creem（API_KEY + PRODUCT_ID）→ creem，否则 → dodo
//   CREEM_API_KEY / CREEM_PRODUCT_ID / CREEM_WEBHOOK_SECRET
//   DODO_PAYMENTS_API_KEY / DODO_PRODUCT_ID / DODO_WEBHOOK_SECRET / DODO_TEST_MODE
//
// 说明：会员权益表与 Webhook 幂等表与支付通道无关，统一复用 creem.ts 里的实现，
// 这样切换通道时已购会员状态不会丢。
import {
  createCheckout as createCreemCheckout,
  creemConfigured,
} from "./creem.ts";
import { createDodoCheckout, dodoConfigured } from "./dodo.ts";

export type PaymentProvider = "creem" | "dodo";

export interface CheckoutOptions {
  requestId: string;
  successUrl: string;
  metadata: Record<string, string>;
}

/** 读取被强制指定的通道；auto 或非法值返回 null */
function forcedProvider(): PaymentProvider | null {
  const raw = (Deno.env.get("PAYMENT_PROVIDER") ?? "auto").toLowerCase();
  if (raw === "creem" || raw === "dodo") return raw;
  return null;
}

/** 当前生效的支付通道 */
export function activeProvider(): PaymentProvider {
  const forced = forcedProvider();
  if (forced === "creem") return "creem";
  if (forced === "dodo") return "dodo";
  if (creemConfigured()) return "creem";
  return "dodo";
}

/** 指定通道是否已配置齐全 */
export function providerConfigured(provider: PaymentProvider): boolean {
  return provider === "creem" ? creemConfigured() : dodoConfigured();
}

/** 当前生效通道是否可用 */
export function paymentsConfigured(): boolean {
  return providerConfigured(activeProvider());
}

/** 按当前通道创建托管收银台，返回跳转地址 */
export async function createCheckout(opts: CheckoutOptions): Promise<string> {
  const provider = activeProvider();
  if (provider === "creem") {
    return await createCreemCheckout(opts);
  }
  return await createDodoCheckout(opts);
}

// 权益相关能力与支付通道无关，直接复用
export {
  getPremiumStatus,
  grantPremium,
  recordWebhookEvent,
  revokePremium,
} from "./creem.ts";
export type { Entitlement } from "./creem.ts";
