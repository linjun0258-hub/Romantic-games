import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../lib/userAuth.ts";

// 无需登录即可访问的路径
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/send-remind",
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
