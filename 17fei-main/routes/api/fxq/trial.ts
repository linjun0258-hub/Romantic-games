// 飞行棋开局权限校验 API
// 规则：
//   游客（未登录）   → 401 { ok:false, reason:"login" }，前端引导注册/登录
//   会员             → { ok:true, role:"member" }，全部版本放行
//   注册登录非会员   → 每天分别可体验 1 次 basic + 1 次 love；
//                     其他版本（couple/adult/private/combo/custom）→ 引导升级会员
import { Handlers } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../../../lib/userAuth.ts";
import { isMember } from "../../../lib/gameAccess.ts";
import { tryRecordUserDailyTrial } from "../../../lib/fxq_trials.ts";

// 非会员每日可免费体验的模式
const FREE_MODES = new Set(["basic", "love"]);
// 所有合法模式
const ALL_MODES = new Set(["basic", "love", "couple", "adult", "private", "combo", "custom"]);

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

    const username = getUsernameFromRequest(req);
    if (!username) {
      // 游客：需要先注册/登录
      return json({ ok: false, reason: "login" }, 401);
    }

    const member = await isMember(username);
    if (member) {
      // 会员：全量解锁
      return json({ ok: true, role: "member" });
    }

    // 注册登录非会员
    if (!FREE_MODES.has(mode)) {
      // 仅会员可用版本
      return json({ ok: false, reason: "vip" });
    }

    // basic / love：按 (当天, 用户名, 模式) 原子计数，每日各 1 次
    const allowed = await tryRecordUserDailyTrial(username, mode);
    if (allowed) {
      return json({ ok: true, role: "free", mode });
    }
    return json({ ok: false, reason: "used", mode });
  },
};
