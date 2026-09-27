// 登录页
import { Head, page } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { findUserByUsername } from "../lib/db.ts";
import { verifyTurnstile, verifyPassword, createSessionToken, sessionCookie } from "../lib/userAuth.ts";

interface LoginData {
  error?: string;
  turnstileSiteKey?: string;
}

export const handler: Handlers<LoginData> = {
  async GET(req, ctx) {
    return ctx.render({
      turnstileSiteKey: Deno.env.get("TURNSTILE_SITE_KEY"),
    });
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const username = (form.get("username") as string | null)?.trim() ?? "";
    const password = (form.get("password") as string | null) ?? "";

    // Turnstile 校验
    const ok = await verifyTurnstile(form.get("cf-turnstile-response"));
    if (!ok) {
      return ctx.render({ error: "人机验证失败，请重试" }, { status: 400 });
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
      <Head>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        />
      </Head>
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-center">登录</h1>
        {data?.error && (
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {data.error}
          </div>
        )}
        <form method="post" action="/login">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" htmlFor="username">用户名</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" htmlFor="password">密码</label>
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
        <p class="mt-4 text-center text-sm text-gray-600">
          还没有账号？
          <a href="/register" class="text-blue-500 hover:underline">注册</a>
        </p>
      </div>
    </div>
  );
}
