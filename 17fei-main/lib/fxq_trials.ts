// 注册登录（非会员）用户每日免费体验计数模块
// 规则：每个注册用户每天分别可体验 1 次基础版(basic) + 1 次恋爱版(love)
// 按 (day, username, mode) 原子计数，跨天自动重置
// 表：user_fxq_daily_trials(day DATE, username VARCHAR(64), mode VARCHAR(16), used INT, PRIMARY KEY(day, username, mode))
import { neon } from "https://esm.sh/@neondatabase/serverless@1.0.0";

const DATABASE_URL = Deno.env.get("DATABASE_URL");
const sql = neon(DATABASE_URL ?? "postgres://invalid");

let initialized = false;

async function ensureDailyTrialsTable() {
  if (initialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS user_fxq_daily_trials (
      day DATE NOT NULL,
      username VARCHAR(64) NOT NULL,
      mode VARCHAR(16) NOT NULL,
      used INT NOT NULL DEFAULT 0,
      PRIMARY KEY (day, username, mode)
    )
  `;
  initialized = true;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// 原子记录当天该模式的首次体验。
// 返回 true  表示这是今日首次体验，放行；
// 返回 false 表示今日该模式已体验过，应引导"明天再来 / 升级会员"。
export async function tryRecordUserDailyTrial(
  username: string,
  mode: string,
): Promise<boolean> {
  await ensureDailyTrialsTable();
  const rows = await sql`
    INSERT INTO user_fxq_daily_trials (day, username, mode, used)
    VALUES (${today()}, ${username}, ${mode}, 1)
    ON CONFLICT (day, username, mode) DO NOTHING
    RETURNING used
  `;
  return rows.length > 0;
}

// 查询某用户今天各模式是否已体验（可选，用于状态展示）
export async function getUserDailyTrialStatus(
  username: string,
): Promise<Record<string, boolean>> {
  await ensureDailyTrialsTable();
  const rows = await sql`
    SELECT mode FROM user_fxq_daily_trials
    WHERE day = ${today()} AND username = ${username}
  `;
  const status: Record<string, boolean> = { basic: false, love: false };
  for (const row of rows) {
    const m = (row as { mode?: string }).mode;
    if (m) status[m] = true;
  }
  return status;
}
