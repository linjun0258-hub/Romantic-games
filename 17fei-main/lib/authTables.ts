// better-auth 数据表初始化与旧用户迁移（幂等，可安全重复调用）
// 复用 db.ts 的 Neon HTTP 驱动 sql 执行 DDL；better-auth 本身使用 betterAuth.ts 中独立的 postgres.js 连接读写
import { sql } from "./db.ts";

let initialized = false;

export async function ensureAuthTables() {
  if (initialized) return;
  initialized = true;
  try {
    // better-auth: user 表
    await sql`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "image" text,
        "createdAt" timestamp NOT NULL,
        "updatedAt" timestamp NOT NULL
      )
    `;
    // account 表（登录凭据：credential 密码 / google OAuth）
    await sql`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" text PRIMARY KEY,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "accountId" text NOT NULL,
        "providerId" text NOT NULL,
        "accessToken" text,
        "refreshToken" text,
        "accessTokenExpiresAt" timestamp,
        "refreshTokenExpiresAt" timestamp,
        "scope" text,
        "password" text,
        "idToken" text,
        "createdAt" timestamp NOT NULL,
        "updatedAt" timestamp NOT NULL
      )
    `;
    // session 表
    await sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "token" text NOT NULL UNIQUE,
        "expiresAt" timestamp NOT NULL,
        "ipAddress" text,
        "userAgent" text,
        "createdAt" timestamp NOT NULL,
        "updatedAt" timestamp NOT NULL
      )
    `;
    // verification 表
    await sql`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" text PRIMARY KEY,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expiresAt" timestamp NOT NULL,
        "createdAt" timestamp NOT NULL,
        "updatedAt" timestamp NOT NULL
      )
    `;
    // 旧 users 表 → better-auth user 表幂等迁移（保留原 bcrypt 密码，老账号可直接登录）
    await sql`
      INSERT INTO "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
      SELECT 'old_' || u.id, u.username, u.email, TRUE, u.created_at, NOW()
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1 FROM "user" ue WHERE ue."email" = u.email
      )
    `;
    // 旧 users 表 → better-auth account 表幂等迁移（credential 凭据，密码沿用 bcrypt 哈希）
    await sql`
      INSERT INTO "account" ("id", "userId", "accountId", "providerId", "password", "createdAt", "updatedAt")
      SELECT 'old_acct_' || u.id, 'old_' || u.id, u.email, 'credential', u.password, NOW(), NOW()
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1 FROM "account" a
        WHERE a."providerId" = 'credential' AND a."accountId" = u.email
      )
    `;
  } catch (err) {
    initialized = false; // 失败时允许下次重试
    throw err;
  }
}
