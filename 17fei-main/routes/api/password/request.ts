// POST /api/password/request —— 发送验证码 / 发送用户名提醒
// 关键改动：不再静默失败。
//   - 邮箱未注册：明确告知（否则用户会一直等一封永远不会来的邮件）
//   - 发信失败：明确告知失败原因分类，而不是假装已发送
// 说明：这里放弃了“绝对不可枚举邮箱”的严格策略，
//   因为对当前体量的小站来说，用户被卡在门外、完全不知道原因，代价更高。
import { Handlers } from "$fresh/server.ts";
import {
  ensureResetTable,
  findUserByEmailCI,
  issueResetCode,
  type MailResult,
  sendResetMail,
  sendUsernameMail,
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

// 把发信失败翻译成用户能看懂、且能据此找管理员处理的提示
function describeMailFailure(r: MailResult): string {
  if (r.reason === "missing_api_key") {
    return "邮件服务未配置（缺少 RESEND_API_KEY），请联系管理员";
  }
  if (r.reason === "network") {
    return "无法连接邮件服务，请稍后重试";
  }
  const status = r.status ?? 0;
  if (status === 401 || status === 403) {
    // 最常见：域名未验证 / 发件地址不属于已验证域名 / 收件人不是账号所有者
    return `邮件被服务商拒绝（${status}）：发件域名未验证或收件地址不在允许范围，请联系管理员配置 MAIL_FROM`;
  }
  if (status === 422) {
    return "邮件被服务商拒绝（422）：发件地址格式不合法，请联系管理员检查 MAIL_FROM";
  }
  if (status === 429) {
    return "发送过于频繁，请稍后重试";
  }
  return `邮件发送失败（${status || "网络异常"}），请稍后重试或联系管理员`;
}

export const handler: Handlers = {
  async POST(req) {
    const form = await req.formData();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    // mode=username 时发送“用户名提醒”，其余按找回密码处理
    const mode = String(form.get("mode") ?? "password") === "username"
      ? "username"
      : "password";

    if (!EMAIL_RE.test(email)) {
      return redirect(
        `/forgot?mode=${mode}&error=${
          encodeURIComponent("请输入有效的邮箱地址")
        }`,
      );
    }

    let user;
    try {
      await ensureResetTable();
      user = await findUserByEmailCI(email);
    } catch (err) {
      console.error("[password/request] 数据库访问失败", err);
      return redirect(
        `/forgot?mode=${mode}&error=${
          encodeURIComponent("服务暂时不可用，请稍后重试")
        }`,
      );
    }

    // 未注册就直接说清楚，避免用户无限等待
    if (!user) {
      return redirect(
        `/forgot?mode=${mode}&email=${encodeURIComponent(email)}&error=${
          encodeURIComponent(
            "该邮箱还没有注册过账号。请检查邮箱是否输错，或改用 Google 账号登录；如需新建账号请先注册。",
          )
        }`,
      );
    }

    // 找回用户名：把用户名发到邮箱，不签发验证码
    if (mode === "username") {
      const sent = await sendUsernameMail(user.email, user.username);
      if (!sent.ok) {
        return redirect(
          `/forgot?mode=username&email=${encodeURIComponent(email)}&error=${
            encodeURIComponent(describeMailFailure(sent))
          }`,
        );
      }
      return redirect(
        `/forgot?mode=username&email=${encodeURIComponent(email)}&sent=1`,
      );
    }

    // 找回密码：签发验证码并真实发信，成功才进入第二步
    let code: string;
    try {
      code = await issueResetCode(user.email);
    } catch (err) {
      console.error("[password/request] 签发验证码失败", err);
      return redirect(
        `/forgot?email=${encodeURIComponent(email)}&error=${
          encodeURIComponent("验证码生成失败，请稍后重试")
        }`,
      );
    }

    const sent = await sendResetMail(user.email, code);
    if (!sent.ok) {
      return redirect(
        `/forgot?email=${encodeURIComponent(email)}&error=${
          encodeURIComponent(describeMailFailure(sent))
        }`,
      );
    }

    return redirect(
      `/forgot?step=code&email=${encodeURIComponent(email)}&sent=1`,
    );
  },
};
