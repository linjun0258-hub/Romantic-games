// POST /api/password/reset —— 校验验证码并设置新密码
import { Handlers } from "$fresh/server.ts";
import {
  consumeResetCode,
  updatePasswordByEmail,
} from "../../../lib/passwordReset.ts";

const MIN_PASSWORD_LENGTH = 6;

function backToCode(email: string, error: string): Response {
  return new Response(null, {
    status: 303,
    headers: {
      Location: `/forgot?step=code&email=${
        encodeURIComponent(email)
      }&error=${encodeURIComponent(error)}`,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}

export const handler: Handlers = {
  async POST(req) {
    const form = await req.formData();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const code = String(form.get("code") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (!email || !code) {
      return backToCode(email, "缺少邮箱或验证码");
    }
    if (!/^\d{6}$/.test(code)) {
      return backToCode(email, "验证码应为 6 位数字");
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return backToCode(email, `新密码至少 ${MIN_PASSWORD_LENGTH} 位`);
    }
    if (password !== confirm) {
      return backToCode(email, "两次输入的密码不一致");
    }

    let result;
    try {
      result = await consumeResetCode(email, code);
    } catch (err) {
      console.error("[password/reset] 校验验证码失败", err);
      return backToCode(email, "服务暂时不可用，请稍后重试");
    }

    if (result === "expired") {
      return backToCode(email, "验证码已过期，请重新获取");
    }
    if (result === "too_many") {
      return backToCode(email, "尝试次数过多，请重新获取验证码");
    }
    if (result !== "ok") {
      return backToCode(email, "验证码错误或已失效");
    }

    /**
     * 验证码已消费。此处不因用户不存在而报错：
     * 验证码本身就只为已注册邮箱签发，走到这一步说明账号存在；
     * 若并发删除等极端情况导致更新 0 行，仍返回统一的成功文案。
     */
    try {
      await updatePasswordByEmail(email, password);
    } catch (err) {
      console.error("[password/reset] 更新密码失败", err);
      return backToCode(email, "密码更新失败，请稍后重试");
    }

    return new Response(null, {
      status: 303,
      headers: {
        Location: "/login?reset=1",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  },
};
