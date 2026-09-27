// 注册页：用户名 + 邮箱 + 密码 + Turnstile 人机验证
import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { ensureTables, findUserByUsername, findUserByEmail, createUser } from "../lib/db.ts";
import { verifyTurnstile, hashPassword, createSessionToken, sessionCookie } from "../lib/userAuth.ts";

interface RegisterData {
  error?: string;
}

// 发送注册欢迎邮件（不阻塞注册流程，失败仅记日志）
async function sendWelcomeEmail(email: string, username: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("未配置 RESEND_API_KEY，跳过欢迎邮件");
    return;
  }
  const from = Deno.env.get("MAIL_FROM") ?? "Couple Game <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "欢迎来到情侣飞行棋 💕",
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2>欢迎你，${username}！</h2>
          <p>你的账号注册成功啦～ 🎉</p>
          <p>现在就邀请你的另一半，开始你们的专属飞行棋之旅吧：</p>
          <p><a href="https://qqq-omega-ten.vercel.app/" style="display:inline-block;background:#db2777;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">立即开始游戏</a></p>
          <p style="color:#999;font-size:12px">如果这不是你本人的操作，请忽略此邮件。</p>
        </div>`,
      }),
    });
    if (!res.ok) {
      console.warn(`欢迎邮件发送失败: ${res.status}`);
    }
  } catch (err) {
    console.warn("欢迎邮件发送异常:", err);
  }
}

export const handler: Handlers<RegisterData> = {
  async GET(_req, ctx) {
    return ctx.render({});
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const username = (form.get("username") as string | null)?.trim() ?? "";
    const email = (form.get("email") as string | null)?.trim() ?? "";
    const password = (form.get("password") as string | null) ?? "";

    // Turnstile 人机验证
    const ok = await verifyTurnstile(form.get("cf-turnstile-response"));
    if (!ok) {
      return ctx.render({ error: "人机验证失败，请重试" }, { status: 400 });
    }

    // 输入校验
    if (!username || !email || !password) {
      return ctx.render({ error: "请填写所有字段" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_-]{2,50}$/.test(username)) {
      return ctx.render({ error: "用户名需为 2-50 位字母、数字、下划线或中划线" }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return ctx.render({ error: "请输入正确的邮箱地址" }, { status: 400 });
    }
    if (password.length < 8) {
      return ctx.render({ error: "密码至少 8 位" }, { status: 400 });
    }

    await ensureTables();

    // 重复检查
    if (await findUserByUsername(username)) {
      return ctx.render({ error: "用户名已被占用" }, { status: 400 });
    }
    if (await findUserByEmail(email)) {
      return ctx.render({ error: "该邮箱已注册" }, { status: 400 });
    }

    // 创建用户（bcrypt 哈希，不存明文）
    const passwordHash = await hashPassword(password);
    await createUser(username, email, passwordHash);

    // 注册成功后发送欢迎邮件（await 确保执行，失败不影响注册）
    await sendWelcomeEmail(email, username);

    // 注册成功即自动登录，跳转首页
    const token = createSessionToken(username);
    const headers = new Headers({ Location: "/" });
    headers.append("Set-Cookie", sessionCookie(token));
    return new Response(null, { status: 303, headers });
  },
};

export default function Register({ data }: PageProps<RegisterData>) {
  return (
    <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Head>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        />
      </Head>
      <h1 class="text-3xl font-bold mb-2">注册</h1>
      <p class="mb-8 text-gray-400">注册后可保存游戏进度</p>
      {data?.error && <p class="mb-4 text-red-400">{data.error}</p>}
      <form
        method="POST"
        action="/register"
        class="w-full max-w-xs flex flex-col gap-4"
      >
        <input
          type="text"
          name="username"
          required
          placeholder="用户名（2-50 位字母或数字）"
          class="px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:border-pink-500 outline-none"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="请输入邮箱地址"
          class="px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:border-pink-500 outline-none"
        />
        <input
          type="password"
          name="password"
          minlength={8}
          required
          placeholder="密码（至少 8 位）"
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
          注册
        </button>
      </form>
      <p class="mt-6 text-sm text-gray-400">
        已有账号？ <a href="/login" class="text-pink-400 hover:underline">登录</a>
      </p>
    </div>
  );
}
