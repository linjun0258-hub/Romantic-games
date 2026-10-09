// better-auth 路由处理器：挂载所有 /api/auth/* 端点（邮箱密码注册/登录、Google OAuth 回调、会话管理）
// 首次请求时自动执行 better-auth 建表与旧用户迁移（幂等）
import { Handlers } from "$fresh/server.ts";
import { auth } from "../../../lib/betterAuth.ts";
import { ensureAuthTables } from "../../../lib/authTables.ts";

export const handler: Handlers = {
  async GET(req) {
    await ensureAuthTables();
    return auth.handler(req);
  },
  async POST(req) {
    await ensureAuthTables();
    return auth.handler(req);
  },
};
