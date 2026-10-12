// 注册登录（非会员）用户一次性体验计数模块（按用户名 + surface 去重，不随天重置）
// 表：user_fxq_trials(username VARCHAR(64), surface VARCHAR(32), used INT DEFAULT 0, PRIMARY KEY(username, surface))
import { neon } from "https://esm.sh/@neondatabase/serverless@1.0.0";

const DATABASE_URL = Deno.env.get("DATABASE_URL");
const sql = neon(DATABASE_URL ?? "postgres://invalid");

let initialized = false;

async function ensureUserFxqTrialsTable() {
  if (initialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS user_fxq_trials (
      username VARCHAR(64) NOT NULL,
      surface VARCHAR(32) NOT NULL,
      used INT NOT NULL DEFAULT 0,
      PRIMARY KEY (username, surface)
    )
  `;
  initialized = true;
}

export interface UserTrialQuota {
  role: "user";
  remaining: number;
  used: number;
  limit: number;
}

export async function getUserTrialQuota(username: string, surface: string, limit: number): Promise<UserTrialQuota> {
  await ensureUserFxqTrialsTable();
  const rows = await sql`
    SELECT used FROM user_fxq_trials
    WHERE username = ${username} AND surface = ${surface}
  `;
  const used = (rows[0]?.used as number | undefined) ?? 0;
  return { role: "user" as const, remaining: Math.max(0, limit - used), used, limit };
}

export async function recordUserTrialPlay(username: string, surface: string): Promise<void> {
  await ensureUserFxqTrialsTable();
  await sql`
    INSERT INTO user_fxq_trials (username, surface, used)
    VALUES (${username}, ${surface}, 1)
    ON CONFLICT (username, surface) DO UPDATE SET used = user_fxq_trials.used + 1
  `;
}
