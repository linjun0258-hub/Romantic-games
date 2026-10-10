// 会话端点路由：/api/auth/* 下与自建会话体系配套的端点
// - GET /api/auth/get-session：返回当前登录用户（供前端 auth-client 查询登录态）
// - GET /api/auth/signout：清除会话 Cookie 并回跳指定页面
// 其余 /api/auth/* 路径返回 404（better-auth 已移除）
import { Handlers } from "$fresh/server.ts";
import {
  clearSessionCookie,
  getUsernameFromRequest,
} from "../../../lib/userAuth.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // 查询当前会话
    if (path === "/api/auth/get-session") {
      const username = getUsernameFromRequest(req);
      if (!username) {
        return new Response(JSON.stringify({ user: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({
          user: { name: username, username, source: "password" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // 退出登录：清除 Cookie 后回跳
    if (path === "/api/auth/signout") {
      const redirectTo = url.searchParams.get("redirect") ?? "/";
      const headers = new Headers({ Location: redirectTo });
      headers.append("Set-Cookie", clearSessionCookie());
      return new Response(null, { status: 302, headers });
    }

    return new Response("Not Found", { status: 404 });
  },
  async POST(_req) {
    // 会话体系仅用 GET；其余一律 404
    return new Response("Not Found", { status: 404 });
  },
};
