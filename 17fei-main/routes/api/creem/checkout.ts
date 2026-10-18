// 支付入口：POST /api/creem/checkout
// 需登录。登录用户点击 Premium 页按钮 → 按当前通道（Creem / Dodo）创建收银台 → 303 跳转
// 未登录/未配置/异常均 303 回 /premium 并带 error 提示
import { Handlers } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../../../lib/userAuth.ts";
import { activeProvider, createCheckout, paymentsConfigured } from "../../../lib/payments.ts";

export const handler: Handlers = {
  async POST(req) {
    const origin = new URL(req.url).origin;
    const back = `${origin}/premium`;
    try {
      const username = getUsernameFromRequest(req);
      if (!username) {
        return Response.redirect(
          `${back}?error=${encodeURIComponent("请先登录再开通会员")}`,
          303,
        );
      }
      if (!paymentsConfigured()) {
        return Response.redirect(
          `${back}?error=${encodeURIComponent("支付功能暂未配置，请联系管理员")}`,
          303,
        );
      }
      const checkoutUrl = await createCheckout({
        requestId: crypto.randomUUID(),
        successUrl: `${origin}/premium?success=1`,
        metadata: { referenceId: username },
      });
      console.log(`[checkout] 通道=${activeProvider()} 用户=${username}`);
      return Response.redirect(checkoutUrl, 303);
    } catch (err) {
      console.error("[checkout] 创建收银台失败", err);
      return Response.redirect(
        `${back}?error=${encodeURIComponent("创建支付会话失败，请稍后重试")}`,
        303,
      );
    }
  },
};
