// Google OAuth 回调处理：授权码换令牌 → 拉取用户信息 → 查找/创建本地用户 → 签发会话 Cookie
// 回调地址须与 GCP OAuth 客户端配置一致：https://<域名>/api/auth/callback/google
import { Handlers } from "$fresh/server.ts";
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  verifySignedState,
} from "../../../../lib/googleOAuth.ts";
import {
  ensureTables,
  findUserByEmail,
  findUserByUsername,
  createUser,
} from "../../../../lib/db.ts";
import {
  createSessionToken,
  sessionCookie,
  hashPassword,
} from "../../../../lib/userAuth.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const fail = (msg: string) =>
      new Response(null, {
        status: 303,
        headers: { Location: `/login?error=${encodeURIComponent(msg)}` },
      });

    // Google 侧错误或用户取消授权
    const oauthError = url.searchParams.get("error");
    if (oauthError) {
      return fail(
        oauthError === "access_denied"
          ? "你取消了 Google 授权"
          : `Google 授权失败：${oauthError}`,
      );
    }

    const code = url.searchParams.get("code");
    if (!code) return fail("未收到 Google 授权码，请重试");

    // 校验 state（防 CSRF + 取回登录前页面）
    const state = url.searchParams.get("state") ?? "";
    const st = await verifySignedState(state);
    if (!st.ok) {
      return fail("登录状态校验失败（已超时或不合法），请重新发起登录");
    }

    // 授权码换令牌，再拉取 Google 用户信息
    let info;
    try {
      const tokens = await exchangeCodeForTokens(code, url.origin);
      info = await fetchGoogleUserInfo(tokens.access_token);
    } catch (e) {
      console.error("[google-oauth] token/userinfo failed:", e);
      return fail("Google 登录失败：令牌交换出错，请重试");
    }

    if (!info.email) return fail("未能获取 Google 账号邮箱，请重试");

    await ensureTables();

    // 查找或创建本地用户（沿用 users 表；邮箱相同即视为同一账号）
    let user = await findUserByEmail(info.email);
    if (!user) {
      let username = (info.name ?? info.email.split("@")[0])
        .slice(0, 40)
        .replace(/[^\w\u4e00-\u9fa5-]+/g, "_") || "user";
      if (await findUserByUsername(username)) {
        username = `${username}-${Math.floor(Math.random() * 10000)}`;
      }
      // users.password 为 NOT NULL：Google 用户写入随机 bcrypt 哈希占位（无法用密码登录）
      const placeholder = await hashPassword(
        crypto.randomUUID() + ":" + crypto.randomUUID(),
      );
      user = await createUser(username, info.email, placeholder);
    }

    // 签发会话 Cookie 并回跳到登录前页面
    const token = createSessionToken(user.username);
    const redirectTo = st.redirectTo || "/";
    const headers = new Headers({ Location: redirectTo });
    headers.append("Set-Cookie", sessionCookie(token));
    return new Response(null, { status: 303, headers });
  },
};
