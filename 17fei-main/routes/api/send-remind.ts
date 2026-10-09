// 定时提醒邮件接口（供 cron-job.org 调用）
// 用法：GET /api/send-remind?secret=你的CRON_SECRET
// 需要环境变量：RESEND_API_KEY（Resend 邮件服务密钥）、CRON_SECRET（调用密钥）、MAIL_FROM（发件人，可选）
import { Handlers } from "$fresh/server.ts";
import { sql } from "../../lib/db.ts";
import { ensureAuthTables } from "../../lib/authTables.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    const cronSecret = Deno.env.get("CRON_SECRET");
    if (!cronSecret || secret !== cronSecret) {
      return new Response(JSON.stringify({ error: "未授权" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("MAIL_FROM") ?? "Couple Game <onboarding@resend.dev>";
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "缺少 RESEND_API_KEY" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // 确保 better-auth 表存在并完成旧用户迁移（幂等）
    await ensureAuthTables();

    // 读取所有注册用户的邮箱（better-auth user 表，含迁移后的老用户）
    const rows = await sql`SELECT "email", "name" FROM "user" WHERE "email" IS NOT NULL`;
    if (rows.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "没有用户" }), {
        headers: { "content-type": "application/json" },
      });
    }

    let sent = 0;
    const failed: string[] = [];

    for (const row of rows) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [row.email],
            subject: "好久没来玩啦，你的飞行棋还等着你 💕",
            html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
              <h2>嗨，${row.name}！</h2>
              <p>好久没有见到你啦～ 快回来继续你们的小游戏吧：</p>
              <p><a href="https://qqq-omega-ten.vercel.app/" style="display:inline-block;background:#db2777;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">立即开始游戏</a></p>
              <p style="color:#999;font-size:12px">如果不想再收到此类邮件，请联系我们。</p>
            </div>`,
          }),
        });
        if (res.ok) {
          sent++;
        } else {
          failed.push(`${row.email}: ${res.status}`);
        }
      } catch {
        failed.push(row.email);
      }
    }

    return new Response(JSON.stringify({ total: rows.length, sent, failed }), {
      headers: { "content-type": "application/json" },
    });
  },
};
