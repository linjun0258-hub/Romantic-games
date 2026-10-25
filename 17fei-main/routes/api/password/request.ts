// POST /api/password/request —— 发送邮箱验证码
// 安全要点：无论邮箱是否已注册，都返回同一跳转路径，避免邮箱枚举
import { Handlers } from "$fresh/server.ts";
import {
  ensureResetTable,
  findUserByEmailCI,
  issueResetCode,
  sendResetMail,
} from "../../../lib/passwordReset.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function redirect(location: string): Response {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}

export const handler: Handlers = {
  async POST(req) {
    const form = await req.formData();
    const email = String(form.get("email") ?? "").trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      return redirect(
        `/forgot?error=${encodeURIComponent("请输入有效的邮箱地址")}`,
      );
    }

    try {
      await ensureResetTable();
      const user = await findUserByEmailCI(email);

      // 账号存在才真正签发与发信（发往库中记录的邮箱）；
      // 不存在时也走同样流程，用户侧无法通过响应差异判断邮箱是否注册
      if (user) {
        const code = await issueResetCode(user.email);
        await sendResetMail(user.email, code);
      }
    } catch (err) {
      console.error("[password/request] 处理失败", err);
      return redirect(
        `/forgot?error=${encodeURIComponent("服务暂时不可用，请稍后重试")}`,
      );
    }

    return redirect(`/forgot?step=code&email=${encodeURIComponent(email)}`);
  },
};
