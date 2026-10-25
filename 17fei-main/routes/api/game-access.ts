// 全站免费：游戏访问权限接口
// 不再区分游客/普通用户/会员，一律返回完全解锁、无限次
import { Handlers } from "$fresh/server.ts";

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

export const handler: Handlers = {
  GET() {
    return json({ role: "member", remaining: 999, unlimited: true, free: true });
  },

  POST() {
    return json({ ok: true, unlimited: true, role: "member", free: true });
  },
};
