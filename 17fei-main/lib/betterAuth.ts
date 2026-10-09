// better-auth 认证配置：PostgreSQL 数据库 + 邮箱密码登录（bcrypt 兼容旧用户）+ Google 社交登录
// 注意：lib/auth.ts 已被会员会话模块占用，故配置放在 lib/betterAuth.ts；
// better-auth 需要 postgres.js 连接实例，而 db.ts 使用 Neon HTTP 驱动，故此处独立建立连接
// 导入统一使用 npm: 原生协议（esm.sh 重定向漂移会触发 Vercel Deno 构建器崩溃）
import { betterAuth } from "npm:better-auth@1.2.8";
import postgres from "npm:postgres@3.4.5";
import bcryptjs from "npm:bcryptjs@2.4.3";
const bcryptHash = (s: string) => bcryptjs.hashSync(s);
const bcryptCompare = (a: string, b: string) => bcryptjs.compareSync(a, b);

const baseURL = Deno.env.get("BETTER_AUTH_URL") ??
  "https://qqq-omega-ten.vercel.app";

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
