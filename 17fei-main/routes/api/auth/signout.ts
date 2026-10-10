// 退出登录端点：GET /api/auth/signout
// 清除会话 Cookie 后回跳到 ?redirect= 指定页面（默认 /）
// 由原 [...all].ts 拆分而来：catch-all 会按字母序先于 callback/ 注册并遮蔽 OAuth 回调，故改为精确路由
import { Handlers } from "$fresh/server.ts";
import { clearSessionCookie } from "../../../lib/userAuth.ts";

export const handler: Handlers = {
  GET(req) {
    const url = new URL(req.url);
    const redirectTo = url.searchParams.get("redirect") ?? "/";
    const headers = new Headers({ Location: redirectTo });
    headers.append("Set-Cookie", clearSessionCookie());
    return new Response(null, { status: 302, headers });
  },
};
