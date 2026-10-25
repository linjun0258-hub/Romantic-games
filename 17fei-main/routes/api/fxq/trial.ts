// 飞行棋开局权限校验 API
// 全站免费：任何模式、任何用户（含未登录游客）都可直接开局，无会员、无次数限制
import { Handlers } from "$fresh/server.ts";

// 所有合法模式
const ALL_MODES = new Set([
  "basic",
  "love",
  "couple",
  "adult",
  "private",
  "combo",
  "custom",
]);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const handler: Handlers = {
  async POST(req) {
    let body: { mode?: string } = {};
    try {
      body = await req.json().catch(() => ({}));
    } catch {
      body = {};
    }
    const mode = String(body.mode ?? "");
    if (!ALL_MODES.has(mode)) {
      return json({ ok: false, reason: "invalid_mode" }, 400);
    }

    // 全站免费：不做登录校验、不做会员校验、不计次
    return json({ ok: true, role: "member", mode, free: true });
  },
};
