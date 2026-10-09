// Google 登录入口：发起 better-auth 的 Google OAuth 流程
// 未配置 GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET 时回登录页并提示
import { Handlers } from "$fresh/server.ts";
import { auth, googleEnabled } from "../../lib/betterAuth.ts";
import { ensureAuthTables } from "../../lib/authTables.ts";

export const handler: Handlers = {
  async GET() {
    if (!googleEnabled) {
      const headers = new Headers({ Location: "/login?error=google_not_configured" });
      return new Response(null, { status: 302, headers });
    }
    await ensureAuthTables();
    try {
      // 发起 OAuth：asResponse 拿到带 Set-Cookie（OAuth state）的 Response
      const res = await auth.api.signInSocial({
        body: { provider: "google", callbackURL: "/" },
        asResponse: true,
      });
      // 响应体为 JSON { url, redirect }，url 即 Google 授权页地址
      const data = await res.json().catch(() => null) as { url?: string } | null;
      const target = data?.url;
      if (!target) {
        const headers = new Headers({ Location: "/login?error=google_failed" });
        return new Response(null, { status: 302, headers });
      }
      // 转发 state Cookie 并 302 跳转到 Google 授权页
      const headers = new Headers({ Location: target });
      for (const c of res.headers.getSetCookie()) {
        headers.append("set-cookie", c);
      }
      return new Response(null, { status: 302, headers });
    } catch (err) {
      console.warn("Google 登录发起失败:", err);
      const headers = new Headers({ Location: "/login?error=google_failed" });
      return new Response(null, { status: 302, headers });
    }
  },
};
