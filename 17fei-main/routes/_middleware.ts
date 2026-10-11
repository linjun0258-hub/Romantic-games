import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../lib/userAuth.ts";
// 无需登录即可访问的路径
// /api/auth/* 必须公开：会话查询(get-session)、退出登录(signout)、
// 以及 Google OAuth 回调(/api/auth/callback/google，Google 跳回时浏览器尚未持有会话 Cookie)
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth",
  // Creem 支付回调：Creem 服务器直连 webhook，无浏览器会话，必须公开
  "/api/creem/webhook",
  // 定价页自身公开（未登录用户可见"登录后开通"提示）
  "/premium",
];

export async function handler(
  request: Request,
  ctx: MiddlewareHandlerContext,
) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  // 登录/注册页公开访问
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!isPublic) {
    const username = getUsernameFromRequest(request);
    if (!username) {
      // 未登录：重定向到登录页
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" },
      });
    }
  }
  const response = await ctx.next();
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}
