// 找回密码页：邮箱验证码两步式表单（服务端渲染 + 传统表单提交，风格与 /login 一致）
// 第一步：填写注册邮箱 → POST /api/password/request
// 第二步：填写 6 位验证码 + 新密码 → POST /api/password/reset
import { Handlers, PageProps } from "$fresh/server.ts";

interface ForgotData {
  step: "email" | "code";
  email: string;
  error?: string;
}

export const handler: Handlers<ForgotData> = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const email = url.searchParams.get("email") ?? "";
    const wantsCode = url.searchParams.get("step") === "code";
    return ctx.render({
      // 没有邮箱就没有第二步可言，强制回到第一步
      step: wantsCode && email ? "code" : "email",
      email,
      error: url.searchParams.get("error") ?? undefined,
    });
  },
};

export default function Forgot({ data }: PageProps<ForgotData>) {
  const step = data?.step ?? "email";
  const email = data?.email ?? "";

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold mb-2 text-center">找回密码</h1>
        <p class="text-sm text-gray-500 text-center mb-6">
          {step === "email"
            ? "输入注册邮箱，我们会发送 6 位验证码"
            : "输入邮件中的验证码并设置新密码"}
        </p>

        {data?.error && (
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {data.error}
          </div>
        )}

        {step === "email"
          ? (
            <form method="post" action="/api/password/request">
              <div class="mb-4">
                <label class="block text-gray-700 mb-2" htmlFor="email">
                  邮箱
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autocomplete="email"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                发送验证码
              </button>
            </form>
          )
          : (
            <form method="post" action="/api/password/reset">
              <input type="hidden" name="email" value={email} />
              <div class="mb-4">
                <label class="block text-gray-700 mb-2" htmlFor="code">
                  验证码
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]{6}"
                  maxlength={6}
                  required
                  autocomplete="one-time-code"
                  placeholder="6 位数字"
                  class="w-full px-3 py-2 border rounded tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">
                  已发送至 {email}，验证码 10 分钟内有效
                </p>
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 mb-2" htmlFor="password">
                  新密码
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  autocomplete="new-password"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 mb-2" htmlFor="confirm">
                  确认新密码
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  minLength={6}
                  required
                  autocomplete="new-password"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                重置密码
              </button>
              <p class="mt-3 text-center text-sm">
                <a
                  href={`/forgot?step=email&email=${
                    encodeURIComponent(email)
                  }`}
                  class="text-blue-500 hover:underline"
                >
                  没收到验证码？重新发送
                </a>
              </p>
            </form>
          )}

        <p class="mt-6 text-center text-sm text-gray-600">
          想起密码了？{" "}
          <a href="/login" class="text-blue-500 hover:underline">返回登录</a>
        </p>
      </div>
    </div>
  );
}
