// better-auth 认证配置：PostgreSQL 数据库 + 邮箱密码登录（bcrypt 兼容旧用户）+ Google 社交登录
// 注意：lib/auth.ts 已被会员会话模块占用，故配置放在 lib/betterAuth.ts；
// better-auth 需要 postgres.js 连接实例，而 db.ts 使用 Neon HTTP 驱动，故此处独立建立连接
import { betterAuth } from "https://esm.sh/better-auth@1.2.8";
import postgres from "https://esm.sh/postgres@3.4.5";
import { hash as bcryptHash, compare as bcryptCompare } from "https://esm.sh/bcryptjs@2.4.3";

const baseURL = Deno.env.get("BETTER_AUTH_URL") ?? "https://qqq-omega-ten.vercel.app";

// better-auth 专用连接（postgres.js 实例，better-auth 内部依赖其查询/事务能力）
const authSql = postgres(Deno.env.get("DATABASE_URL") ?? "postgres://invalid", {
  prepare: false,
  max: 5,
});

const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
export const googleEnabled = Boolean(googleClientId && googleClientSecret);

export const auth = betterAuth({
  database: authSql,
  secret: Deno.env.get("SESSION_SECRET") ?? "better-auth-dev-secret-change-me",
  baseURL,
  trustedOrigins: [baseURL],
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password: string) => bcryptHash(password),
      verify: async ({ password, hash }: { password: string; hash: string }) =>
        bcryptCompare(password, hash),
    },
  },
  ...(googleEnabled
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
          },
        },
      }
    : {}),
});
