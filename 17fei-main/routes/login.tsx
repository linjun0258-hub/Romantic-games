// 登录页：用户名/邮箱 + 密码 + Turnstile 人机验证（better-auth）
import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { auth } from "../lib/betterAuth.ts";
import { ensureAuthTables } from "../lib/authTables.ts";
import { sql } from "../lib/db.ts";
import { verifyTurnstile } from "../lib/userAuth.ts";

interface LoginData {
  error?: string;
}

export const handler: Handlers<LoginData> = {
  async GET(_req, ctx) {
    return ctx.render({});
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const identifier = (form.get("username") as string | null)?.trim() ?? "";
    const password = (form.get("password") as string | null) ?? "";

    // Turnstile 人机验证
    const ok = await verifyTurnstile(form.get("cf-turnstile-response"));
    if (!ok) {
      return ctx.render({ error: "人机验证失败，请重试" }, { status: 400 });
    }

    if (!identifier || !password) {
      return ctx.render({ error: "请填写所有字段" }, { status: 400 });
    }

    await ensureAuthTables();

    // 兼容老习惯：输入用户名时，先按用户名查出注册邮箱
    let email = identifier;
    if (!identifier.includes("@")) {
      const rows = await sql`SELECT "email" FROM "user" WHERE "name" = ${identifier} LIMIT 1`;
      if (rows.length === 0) {
        return ctx.render({ error: "用户名或密码错误" }, { status: 400 });
      }
      email = rows[0].email as string;
    }

    // better-auth 邮箱密码登录（bcrypt 自定义哈希，与老用户密码兼容）
    const res = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });
    if (!res.ok) {
      return ctx.render({ error: "用户名或密码错误" }, { status: 400 });
    }

    // 复制会话 Cookie，跳转首页
    const headers = new Headers({ Location: "/" });
    for (const c of res.headers.getSetCookie()) {
      headers.append("set-cookie", c);
    }
    return new Response(null, { status: 303, headers });
  },
};

export default function Login({ data }: PageProps<LoginData>) {
  return (
    <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Head>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        />
      </Head>
      <h1 class="text-3xl font-bold mb-2">登录</h1>
      <p class="mb-8 text-gray-400">欢迎回来～</p>
      {data?.error && <p class="mb-4 text-red-400">{data.error}</p>}
      <form
        method="POST"
        action="/login"
        class="w-full max-w-xs flex flex-col gap-4"
      >
        <input
          type="text"
          name="username"
          required
          placeholder="用户名或邮箱"
          class="px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:border-pink-500 outline-none"
        />
        <input
          type="password"
          name="password"
          required
          placeholder="密码"
          class="px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:border-pink-500 outline-none"
        />
        <div
          class="cf-turnstile"
          data-sitekey="0x4AAAAAAE94JmZM0XJ7hwkd"
        />
        <button
          type="submit"
          class="px-4 py-3 rounded bg-pink-600 hover:bg-pink-500 font-bold"
        >
          登录
        </button>
      </form>
      <a
        href="/login/google"
        class="mt-4 w-full max-w-xs px-4 py-3 rounded bg-white text-gray-900 font-bold text-center"
      >
        使用 Google 登录
      </a>
      <p class="mt-6 text-sm text-gray-400">
        还没有账号？ <a href="/register" class="text-pink-400 hover:underline">注册</a>
      </p>
    </div>
  );
}
