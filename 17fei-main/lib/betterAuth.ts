// better-auth 认证配置：PostgreSQL 数据库 + 邮箱密码登录（bcrypt 兼容旧用户）+ Google 社交登录
// 注意：本项目的 lib/auth.ts 已被会员会话模块占用，故 better-auth 配置放在 lib/betterAuth.ts
import { betterAuth } from "https://esm.sh/better-auth@1.2.8";
import { sql } from "./db.ts";
import { hash as bcryptHash, compare as bcryptCompare } from "https://esm.sh/bcryptjs@2.4.3";

const baseURL = Deno.env.get("BETTER_AUTH_URL") ?? "https://qqq-omega-ten.vercel.app";

const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
export const googleEnabled = Boolean(googleClientId && googleClientSecret);

export const auth = betterAuth({
  database: sql,
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
