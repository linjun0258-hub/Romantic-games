// 找回页：同时支持「忘记密码」与「忘记用户名」两条路径
//   第一步 mode=email   ：填注册邮箱 → 发验证码（密码）或发用户名（用户名）
//   第二步 step=code    ：填 6 位验证码 + 新密码
// 重要：所有失败都会明确显示原因，不再出现“显示已发送但根本没发出去”
import { Handlers, PageProps } from "$fresh/server.ts";

interface ForgotData {
  step: "email" | "code";
  mode: "password" | "username";
  email: string;
  error?: string;
  sent?: boolean;
}

export const handler: Handlers<ForgotData> = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const email = url.searchParams.get("email") ?? "";
    const mode = url.searchParams.get("mode") === "username"
      ? "username"
      : "password";
    const wantsCode = url.searchParams.get("step") === "code";
    return ctx.render({
      // 没有邮箱就没有第二步可言，强制回到第一步
      step: wantsCode && email ? "code" : "email",
      mode,
      email,
      error: url.searchParams.get("error") ?? undefined,
      sent: url.searchParams.get("sent") === "1",
    });
  },
};

export default function Forgot({ data }: PageProps<ForgotData>) {
  const step = data?.step ?? "email";
  const mode = data?.mode ?? "password";
  const email = data?.email ?? "";
  const sent = data?.sent === true;

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold mb-2 text-center">找回密码 / 用户名</h1>
        <p class="text-sm text-gray-500 text-center mb-6">
          {step === "email"
            ? "输入注册邮箱：可以收验证码重置密码，也可以把用户名发给你"
            : "输入邮件中的验证码并设置新密码"}
        </p>

        {data?.error && (
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm leading-relaxed">
            <strong class="block mb-1">操作未完成</strong>
            {data.error}
          </div>
        )}

        {sent && !data?.error && (
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {mode === "username"
              ? `用户名已发送到 ${email}，请查看收件箱（也请看一下垃圾邮件）。`
              : `验证码已发送到 ${email}，10 分钟内有效。`}
          </div>
        )}

        {step === "email"
          ? (
            <form method="post" action="/api/password/request">
              <div class="mb-4">
                <label class="block text-gray-700 mb-2" htmlFor="email">
                  注册邮箱
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  autocomplete="email"
                  placeholder="你注册时填写的邮箱"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                name="mode"
                value="password"
                class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-3"
              >
                发送验证码，重置密码
              </button>

              <button
                type="submit"
                name="mode"
                value="username"
                class="w-full bg-white text-blue-600 border border-blue-500 py-2 px-4 rounded hover:bg-blue-50"
              >
                我连用户名也忘了，把用户名发到邮箱
              </button>

              <div class="mt-4 bg-blue-50 border border-blue-200 text-blue-800 text-xs leading-relaxed p-3 rounded">
                提示：重置密码<b>不需要用户名</b>，只要有注册邮箱就能走完流程。
                如果你连邮箱也记不清，可以试试常用的几个邮箱地址。
              </div>
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
                  发送至 {email}，验证码 10 分钟内有效
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
                  placeholder="至少 6 位"
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
                  href={`/forgot?email=${encodeURIComponent(email)}`}
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
