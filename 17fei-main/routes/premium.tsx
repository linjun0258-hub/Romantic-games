// Premium 会员定价页：/premium
// 三分支渲染：已开通（展示订阅邮箱）/ 可购买（纯表单 POST 发起 Creem Checkout）/ 支付通道未配置
// 无客户端 JS：购买通过 <form method="POST" action="/api/creem/checkout"> 原生提交
import { Handlers, PageProps } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../lib/userAuth.ts";
import { creemConfigured, getPremiumStatus } from "../lib/creem.ts";
import type { Entitlement } from "../lib/creem.ts";

interface PremiumPageData {
  username: string | null;
  entitlement: Entitlement | null;
  configured: boolean;
  error: string | null;
  success: boolean;
}

const ACTIVE_STATUSES = new Set(["active", "trialing", "paid"]);

export const handler: Handlers<PremiumPageData> = {
  async GET(req, ctx) {
    const username = getUsernameFromRequest(req);
    const url = new URL(req.url);

    let entitlement: Entitlement | null = null;
    if (username) {
      try {
        entitlement = await getPremiumStatus(username);
      } catch (err) {
        // 查询失败不阻塞页面，按未开通渲染
        console.error("[premium] 查询会员权益失败", err);
      }
    }

    const data: PremiumPageData = {
      username,
      entitlement,
      configured: creemConfigured(),
      error: url.searchParams.get("error"),
      success: url.searchParams.get("success") === "1",
    };
    return ctx.render(data);
  },
};

export default function PremiumPage({ data }: PageProps<PremiumPageData>) {
  const { username, entitlement, configured, error, success } = data;
  const isPremium = !!entitlement && ACTIVE_STATUSES.has(entitlement.status);

  return (
    <div class="min-h-screen bg-gradient-to-b from-pink-50 to-rose-100 px-4 py-12">
      <div class="mx-auto max-w-xl">
        <h1 class="text-center text-3xl font-bold text-rose-700">
          情侣飞行棋 Premium
        </h1>
        <p class="mt-2 text-center text-sm text-rose-500">
          解锁全部会员功能，让两个人的游戏时光更有仪式感
        </p>

        {success && (
          <div class="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            🎉 支付流程已完成！会员权益通常在几秒内自动开通，刷新本页即可看到。
          </div>
        )}
        {error && (
          <div class="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            发起支付失败：{error}
          </div>
        )}

        {isPremium ? (
          <div class="mt-8 rounded-2xl bg-white p-8 text-center shadow-lg">
            <div class="text-4xl">💞</div>
            <h2 class="mt-3 text-xl font-semibold text-gray-800">
              你已是 Premium 会员
            </h2>
            <p class="mt-2 text-sm text-gray-500">
              感谢支持！会员权益已生效。
              {entitlement?.customerEmail && (
                <span>（订阅邮箱：{entitlement.customerEmail}）</span>
              )}
            </p>
            <a
              href="/"
              class="mt-6 inline-block rounded-full bg-rose-500 px-8 py-3 text-white hover:bg-rose-600"
            >
              返回首页开玩
            </a>
          </div>
        ) : (
          <div class="mt-8 rounded-2xl bg-white p-8 shadow-lg">
            <div class="text-center">
              <div class="text-4xl font-bold text-rose-600">$4.99</div>
              <div class="mt-1 text-xs text-gray-400">
                每月，自动续订，随时可取消
              </div>
            </div>
            <ul class="mt-6 space-y-2 text-sm text-gray-600">
              <li>✨ 解锁全部主题棋盘与事件卡</li>
              <li>♾️ 无限房间与好友对战</li>
              <li>💌 专属情侣任务与纪念日提醒</li>
            </ul>
            {configured ? (
              <form method="POST" action="/api/creem/checkout" class="mt-8">
                <button
                  type="submit"
                  class="w-full rounded-full bg-rose-500 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-rose-600"
                >
                  {username ? "立即开通 Premium" : "登录后开通"}
                </button>
              </form>
            ) : (
              <p class="mt-8 rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
                支付通道暂未配置，请稍后再试。
              </p>
            )}
            {!username && (
              <p class="mt-4 text-center text-xs text-gray-400">
                需要登录后才能发起支付，
                <a href="/login" class="text-rose-500 underline">去登录</a>
              </p>
            )}
          </div>
        )}

        <p class="mt-6 text-center text-xs text-gray-400">
          支付由 Creem 安全处理（当前为测试模式，不会产生真实扣款）。
        </p>
      </div>
    </div>
  );
}
