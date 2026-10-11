// 游客试玩限额计数模块（按天 + IP + surface 三维去重）
// 表：guest_plays(day DATE, ip VARCHAR(64), surface VARCHAR(32), used INT DEFAULT 0, PRIMARY KEY(day, ip, surface))
import { neon } from "npm:@neondatabase/serverless@1.0.0";

const DATABASE_URL = Deno.env.get("DATABASE_URL");
const sql = neon(DATABASE_URL ?? "postgres://invalid");

let initialized = false;

export async function ensureGuestPlaysTable() {
  if (initialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS guest_plays (
      day DATE NOT NULL,
      ip VARCHAR(64) NOT NULL,
      surface VARCHAR(32) NOT NULL,
      used INT NOT NULL DEFAULT 0,
      PRIMARY KEY (day, ip, surface)
    )
  `;
  initialized = true;
}

export interface GuestQuota {
  role: "guest";
  remaining: number;
  used: number;
  limit: number;
}

export async function getGuestQuota(ip: string, surface: string, limit: number): Promise<GuestQuota> {
  const today = new Date().toISOString().slice(0, 10);
  await ensureGuestPlaysTable();
  const rows = await sql`
    SELECT used FROM guest_plays
    WHERE day = ${today} AND ip = ${ip} AND surface = ${surface}
  `;
  const used = (rows[0]?.used as number | undefined) ?? 0;
  return { role: "guest" as const, remaining: Math.max(0, limit - used), used, limit };
}

export async function recordGuestPlay(ip: string, surface: string, limit: number): Promise<GuestQuota> {
  const today = new Date().toISOString().slice(0, 10);
  await ensureGuestPlaysTable();
  await sql`
    INSERT INTO guest_plays (day, ip, surface, used)
    VALUES (${today}, ${ip}, ${surface}, 1)
    ON CONFLICT (day, ip, surface) DO UPDATE SET used = guest_plays.used + 1
  `;
  const rows = await sql`
    SELECT used FROM guest_plays
    WHERE day = ${today} AND ip = ${ip} AND surface = ${surface}
  `;
  const used = (rows[0]?.used as number | undefined) ?? 1;
  return { role: "guest" as const, remaining: Math.max(0, limit - used), used, limit };
}

export const GUEST_LIMITS: Record<string, number> = { fxq: 1, card: 3, position: 3 };

export function clientIpFromRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const first = fwd.split(",")[0].trim();
  if (first) return first;
  return req.headers.get("x-real-ip") ?? "unknown";
}

// 会员判定：premium_entitlements.status ∈ {active, trialing, paid}（表由 Creem webhook 维护）
export async function isMember(username: string): Promise<boolean> {
  try {
    const rows = await sql`
      SELECT status FROM premium_entitlements WHERE username = ${username} LIMIT 1
    `;
    if (!rows.length) return false;
    const status = String(rows[0].status);
    return status === "active" || status === "trialing" || status === "paid";
  } catch {
    // 表暂不存在等异常：按非会员处理
    return false;
  }
}
