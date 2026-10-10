// 登录页：用户名密码 + Google OAuth 登录
// Turnstile 仅在服务端配置了 TURNSTILE_SECRET_KEY 时启用，避免凭据缺失导致登录被卡死
import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { findUserByUsername } from "../lib/db.ts";
import {
  verifyTurnstile,
  verifyPassword,
  createSessionToken,
  sessionCookie,
} from "../lib/userAuth.ts";

interface LoginData {
  error?: string;
  turnstileSiteKey?: string;
}

const turnstileEnabled = () => Boolean(Deno.env.get("TURNSTILE_SECRET_KEY"));

export const handler: Handlers<LoginData> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    return ctx.render({
      // OAuth 回调等流程失败时通过 ？error= 带回提示
      error: url.searchParams.get("error") ?? undefined,
      turnstileSiteKey: turnstileEnabled()
        ? Deno.env.get("TURNSTILE_SITE_KEY")
        : undefined,
    });
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const username = (form.get("username") as string | null)?.trim() ?? "";
    const password = (form.get("password") as string | null) ?? "";

    // 人机验证：仅当服务端配置了密钥时才校验
    if (turnstileEnabled()) {
      const ok = await verifyTurnstile(form.get("cf-turnstile-response"));
      if (!ok) {
        return ctx.render({ error: "人机验证失败，请重试" }, { status: 400 });
      }
    }

    if (!username || !password) {
      return ctx.render({ error: "请输入用户名和密码" }, { status: 400 });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return ctx.render({ error: "用户不存在" }, { status: 400 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return ctx.render({ error: "密码错误" }, { status: 400 });
    }

    // 登录成功，签发会话 Cookie 并跳转首页
    const token = createSessionToken(username);
    const headers = new Headers({ Location: "/" });
    headers.append("Set-Cookie", sessionCookie(token));
    return new Response(null, { status: 303, headers });
  },
};

export default function Login({ data }: PageProps<LoginData>) {
  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      {data?.turnstileSiteKey && (
        <Head>
          <script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
          />
        </Head>
      )}
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-center">登录</h1>
        {data?.error && (
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {data.error}
          </div>
        )}
        <form method="post" action="/login">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" htmlFor="username">
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {data?.turnstileSiteKey && (
            <div
              class="cf-turnstile mb-4"
              data-sitekey={data.turnstileSiteKey}
            />
          )}
          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            登录
          </button>
        </form>
        <div class="my-5 flex items-center gap-3">
          <div class="h-px flex-1 bg-gray-300"></div>
          <span class="text-xs text-gray-400">或</span>
          <div class="h-px flex-1 bg-gray-300"></div>
        </div>
        <a
          href="/login/google"
          class="w-full flex items-center justify-center gap-2 border border-gray-300 rounded py-2 px-4 text-gray-700 hover:bg-gray-50 font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          使用 Google 账号登录
        </a>
        <p class="mt-4 text-center text-sm text-gray-600">
          还没有账号？{" "}
          <a href="/register" class="text-blue-500 hover:underline">注册</a>
        </p>
      </div>
    </div>
  );
}
