// Google 登录入口：发起自建 Google OAuth 流程（原生 API 实现，零 npm 依赖）
// 凭据来自环境变量 GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
// 未配置时回登录页并提示
import { Handlers } from "$fresh/server.ts";
import { buildAuthorizeUrl, googleConfigured } from "../../lib/googleOAuth.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    if (!googleConfigured()) {
      const headers = new Headers({
        Location: `/login?error=${encodeURIComponent("Google 登录暂未配置，请联系管理员")}`,
      });
      return new Response(null, { status: 302, headers });
    }
    // 支持登录前页面回跳：/login/google?redirect=/member
    const redirectTo = url.searchParams.get("redirect") ?? "/";
    const target = await buildAuthorizeUrl(url.origin, redirectTo);
    return new Response(null, { status: 302, headers: { Location: target } });
  },
};
