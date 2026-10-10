// 会话查询端点：GET /api/auth/get-session
// 返回当前登录用户（供前端 auth-client 查询登录态）
// 由原 [...all].ts 拆分而来：catch-all 会按字母序先于 callback/ 注册并遮蔽 OAuth 回调，故改为精确路由
import { Handlers } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../../../lib/userAuth.ts";

export const handler: Handlers = {
  GET(req) {
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
  },
};
