import { Handlers } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../../lib/userAuth.ts";
import { getGuestQuota, isMember, recordGuestPlay } from "../../lib/gameAccess.ts";

const LIMITS: Record<string, number> = { fxq: 1, card: 3, position: 3 };

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0].trim();
  return ip || req.headers.get("x-real-ip") || "unknown";
}

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const surface = url.searchParams.get("surface") ?? "card";
    const username = getUsernameFromRequest(req);
    if (username) {
      // 已登录：会员返回 member（解锁全部版本），普通用户返回 free（限恋爱版）
      const member = await isMember(username);
      return json({ role: member ? "member" : "free", remaining: 999, unlimited: true });
    }
    const ip = clientIp(req);
    const limit = LIMITS[surface] ?? 3;
    const quota = await getGuestQuota(ip, surface, limit);
    return json(quota);
  },
  async POST(req) {
    const username = getUsernameFromRequest(req);
    if (username) {
      return json({ ok: true, unlimited: true });
    }
    let body: { surface?: string } = {};
    try {
      body = await req.json().catch(() => ({}));
    } catch {
      body = {};
    }
    const surface = String(body.surface ?? "card");
    const limit = LIMITS[surface] ?? 3;
    const ip = clientIp(req);
    const quota = await recordGuestPlay(ip, surface, limit);
    return json(quota);
  },
};

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}
