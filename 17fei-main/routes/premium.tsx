// Premium 会员定价页：/premium
// 三分支渲染：已开通（展示订阅邮箱）/ 可购买（纯表单 POST 发起 Creem Checkout）/ 支付通道未配置
// 无客户端 JS：购买通过 <form method="POST" action="/api/creem/checkout"> 原生提交
// 配色注意：项目 pins twind@0.16.19（Tailwind 2 调色板，无 rose/amber），统一使用 pink/red/green/yellow/gray
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
// Premium 会员定价页：/premium
// 三分支渲染：已开通（展示订阅邮箱）/ 可购买（纯表单 POST 发起 Creem Checkout）/ 支付通道未配置
// 无客户端 JS：购买通过 <form method="POST" action="/api/creem/checkout"> 原生提交
// 配色注意：项目 pins twind@0.16.19（Tailwind 2 调色板，无 rose/amber），统一使用 pink/red/green/yellow/gray
// 回跳验签：按 Creem 文档 Verifying Redirect Signatures，支付成功回跳附带 signature 参数
// （HMAC-SHA256，密钥为 CREEM_API_KEY，对排序后的非空 Creem 参数做 k=v& 拼接），验签通过才展示成功横幅
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
  verifiedOrderId: string | null;
  invalidSignature: boolean;
}

const ACTIVE_STATUSES = new Set(["active", "trialing", "paid"]);

// Creem 回跳签名覆盖的字段（signature 本身与业务参数 success 不参与签名）
const REDIRECT_PARAM_KEYS = [
  "checkout_id",
  "customer_id",
  "order_id",
  "product_id",
  "request_id",
  "subscription_id",
];

async function verifyRedirectSignature(
  params: URLSearchParams,
  apiKey: string,
): Promise<boolean> {
  const signature = params.get("signature");
  if (!signature || !apiKey) return false;
  const entries: Array<[string, string]> = [];
  for (const key of REDIRECT_PARAM_KEYS) {
    const value = params.get(key);
    if (value !== null) entries.push([key, value]);
  }
  if (entries.length === 0) return false;
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const payload = entries.map(([k, v]) => `${k}=${v}`).join("&");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(apiKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // 常量时间比较，防时序攻击
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export const handler: Handlers<PremiumPageData> = {
  async GET(req, ctx) {
    const username = getUsernameFromRequest(req);
    const url = new URL(req.url);
    const apiKey = Deno.env.get("CREEM_API_KEY") ?? "";

    let entitlement: Entitlement | null = null;
    if (username) {
      try {
        entitlement = await getPremiumStatus(username);
      } catch (err) {
        // 查询失败不阻塞页面，按未开通渲染
        console.error("[premium] 查询会员权益失败", err);
      }
    }

    // 支付成功回跳验签：仅当 URL 携带 signature 时校验；
    // 验签通过才展示成功横幅，防止伪造 /premium?success=1
    let verifiedOrderId: string | null = null;
    let invalidSignature = false;
    let verified = false;
    if (url.searchParams.get("signature")) {
      if (await verifyRedirectSignature(url.searchParams, apiKey)) {
        verified = true;
        verifiedOrderId = url.searchParams.get("order_id");
      } else {
        invalidSignature = true;
      }
    }

    const data: PremiumPageData = {
      username,
      entitlement,
      configured: creemConfigured(),
      error: url.searchParams.get("error"),
      success: url.searchParams.get("success") === "1" && verified,
      verifiedOrderId,
      invalidSignature,
    };
    return ctx.render(data);
  },
};

export default function PremiumPage({ data }: PageProps<PremiumPageData>) {
  const {
    username,
    entitlement,
    configured,
    error,
    success,
    verifiedOrderId,
    invalidSignature,
  } = data;
  const isPremium = !!entitlement && ACTIVE_STATUSES.has(entitlement.status);

  return (
    <div class="min-h-screen bg-gray-100 px-4 py-12">
      <div class="mx-auto max-w-xl">
        <h1 class="text-center text-3xl font-bold text-pink-700">
          情侣飞行棋 Premium
        </h1>
        <p class="mt-2 text-center text-sm text-pink-600">
          解锁全部会员功能，让两个人的游戏时光更有仪式感
        </p>

        {success && (
          <div class="mt-6 rounded-lg border border-green-200 bg-green-100 px-4 py-3 text-sm text-green-700">
            🎉 支付流程已完成（Creem 回跳签名已验证{verifiedOrderId
              ? `，订单 ${verifiedOrderId}`
              : ""}）！会员权益通常在几秒内由 Webhook 自动开通，刷新本页即可看到。
          </div>
        )}
        {invalidSignature && (
          <div class="mt-6 rounded-lg border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-700">
            支付回跳签名验证未通过，已忽略本次成功状态。如确已完成支付，请稍后刷新本页。
          </div>
        )}
        {error && (
          <div class="mt-6 rounded-lg border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-700">
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
              class="mt-6 inline-block rounded-full bg-pink-500 px-8 py-3 text-white hover:bg-pink-600"
            >
              返回首页开玩
            </a>
          </div>
        ) : (
          <div class="mt-8 rounded-2xl bg-white p-8 shadow-lg">
            <div class="text-center">
              <div class="text-4xl font-bold text-pink-600">$4.99</div>
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
                  class="w-full rounded-full bg-pink-500 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-pink-600"
                >
                  {username ? "立即开通 Premium" : "登录后开通"}
                </button>
              </form>
            ) : (
              <p class="mt-8 rounded-lg bg-yellow-100 px-4 py-3 text-center text-sm text-yellow-700">
                支付通道暂未配置，请稍后再试。
              </p>
            )}
            {!username && (
              <p class="mt-4 text-center text-xs text-gray-400">
                需要登录后才能发起支付，
                <a href="/login" class="text-pink-600 underline">去登录</a>
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
    <div class="min-h-screen bg-gray-100 px-4 py-12">
      <div class="mx-auto max-w-xl">
        <h1 class="text-center text-3xl font-bold text-pink-700">
          情侣飞行棋 Premium
        </h1>
        <p class="mt-2 text-center text-sm text-pink-600">
          解锁全部会员功能，让两个人的游戏时光更有仪式感
        </p>

        {success && (
          <div class="mt-6 rounded-lg border border-green-200 bg-green-100 px-4 py-3 text-sm text-green-700">
            🎉 支付流程已完成！会员权益通常在几秒内自动开通，刷新本页即可看到。
          </div>
        )}
        {error && (
          <div class="mt-6 rounded-lg border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-700">
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
              class="mt-6 inline-block rounded-full bg-pink-500 px-8 py-3 text-white hover:bg-pink-600"
            >
              返回首页开玩
            </a>
          </div>
        ) : (
          <div class="mt-8 rounded-2xl bg-white p-8 shadow-lg">
            <div class="text-center">
              <div class="text-4xl font-bold text-pink-600">$4.99</div>
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
                  class="w-full rounded-full bg-pink-500 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-pink-600"
                >
                  {username ? "立即开通 Premium" : "登录后开通"}
                </button>
              </form>
            ) : (
              <p class="mt-8 rounded-lg bg-yellow-100 px-4 py-3 text-center text-sm text-yellow-700">
                支付通道暂未配置，请稍后再试。
              </p>
            )}
            {!username && (
              <p class="mt-4 text-center text-xs text-gray-400">
                需要登录后才能发起支付，
                <a href="/login" class="text-pink-600 underline">去登录</a>
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
