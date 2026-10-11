// /fxq 路由接管：服务端按身份注入 lockVip 开关
// - 会员（premium_entitlements.status=active）：lockVip=false，全部棋盘版本解锁
// - 免费登录用户 / 游客：lockVip=true，仅基础版 + 恋爱版
// - 游客每日 1 次（后端 IP 计数 + localStorage 双层），用完返回引导页（登录 / 升级会员）
// 模板来自 lib/fxq_html.ts（由 static/fxq/index.html JSON 内嵌 + __LOCKVIP__ 占位符生成）
import { Handlers } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../lib/userAuth.ts";
import {
  clientIpFromRequest,
  getGuestQuota,
  isMember,
  recordGuestPlay,
} from "../lib/gameAccess.ts";
import { FXQ_HTML } from "../lib/fxq_html.ts";

const LOCKED_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>情侣飞行棋</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:linear-gradient(180deg,#fdf2f8,#f3e8ff,#fff); font-family:system-ui,sans-serif; }
  .box { text-align:center; padding:2.5rem 2rem; max-width:24rem; }
  h1 { font-size:1.5rem; color:#be185d; margin:0 0 .5rem; }
  p { color:#6b7280; margin:.25rem 0; }
  .btn { display:inline-block; margin:.5rem .25rem 0; padding:.7rem 1.4rem; border-radius:9999px;
         font-weight:600; text-decoration:none; }
  .btn-pink { background:#ec4899; color:#fff; }
  .btn-ghost { border:1px solid #f9a8d4; color:#db2777; }
</style>
</head>
<body>
  <div class="box">
    <div style="font-size:3rem">🎲</div>
    <h1>今日免费体验已用完</h1>
    <p>游客每天可体验 1 次飞行棋，明天再来～</p>
    <p>登录后不限次数畅玩基础版和恋爱版</p>
    <a class="btn btn-pink" href="/login">登录 / 注册</a>
    <a class="btn btn-ghost" href="/premium">升级会员解锁全部版本</a>
  </div>
</body>
</html>`;

// 游客本地双层计数：当日已体验过 → 覆盖锁定遮罩（localStorage 层，弥补出口 IP 变化时的后端 IP 盲区）
const GUEST_QUOTA_SCRIPT = `<script>(function(){try{var d=new Date(),k="fxq_used_"+d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+(d.getDate())).slice(-2);if(localStorage.getItem(k)){var o=document.createElement("div");o.style.cssText="position:fixed;left:0;top:0;right:0;bottom:0;background:#fff0f6;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:system-ui,sans-serif";o.innerHTML='<div style="font-size:3rem;margin-bottom:8px">🎲</div><div style="font-size:22px;font-weight:700;color:#be185d;margin-bottom:10px">今日免费体验已用完</div><div style="color:#6b7280;margin-bottom:4px">游客每天可体验 1 次飞行棋，明天再来～</div><div style="color:#6b7280;margin-bottom:20px">登录后不限次数畅玩基础版和恋爱版</div><div><a href="/login" style="display:inline-block;margin:0 4px;padding:.7rem 1.4rem;border-radius:9999px;background:#ec4899;color:#fff;font-weight:600;text-decoration:none">登录 / 注册</a><a href="/premium" style="display:inline-block;margin:0 4px;padding:.7rem 1.4rem;border-radius:9999px;border:1px solid #f9a8d4;color:#db2777;font-weight:600;text-decoration:none">升级会员</a></div>';(document.body||document.documentElement).appendChild(o);}else{localStorage.setItem(k,"1");}}catch(e){}})();</script>`;

export const handler: Handlers = {
  async GET(req) {
    const username = getUsernameFromRequest(req);
    if (username) {
      // 登录用户：会员全开（locked=false）；免费用户锁定高级版本（基础 + 恋爱可玩）
      const member = await isMember(username);
      return render(FXQ_HTML, !member);
    }
    // 游客：每日 1 次（后端 IP 计数），用完显示引导页
    const ip = clientIpFromRequest(req);
    const quota = await getGuestQuota(ip, "fxq", 1);
    if (quota.remaining <= 0) {
      return new Response(LOCKED_HTML, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
    await recordGuestPlay(ip, "fxq", 1);
    // 游客与免费用户一致：锁定高级版本，可玩基础版 + 恋爱版；附带 localStorage 双层计数脚本
    return render(FXQ_HTML, true, GUEST_QUOTA_SCRIPT);
  },
};

function render(template: string, locked: boolean, extraScript = ""): Response {
  const body = template
    // 按身份改写 lockVip 开关（游戏加载前读取）
    .replace("__LOCKVIP__", locked ? "true" : "false")
    // 文档基准修正：页面挂在 /fxq（无尾斜杠、基准为 /），bundle 内相对 publicPath 的懒加载页面 chunk
    // 会被请求到 /static/js/pages-*.js（404→白屏）；注入 <base> 后解析到 /fxq/static/js/（与原站 /fxq/index.html 一致）
    .replace("<head>", '<head><base href="/fxq/">')
    // 静态资源相对路径 ./static/ → /fxq/static/（src 属性为无引号写法，兼容引号形式）
    .replace(/=(["']?)\.\/static\//g, "=$1/fxq/static/")
    // 游客 localStorage 双层计数脚本注入到 #app 之后（body 已存在，遮罩可立即挂载）
    .replace("<div id=app></div>", "<div id=app></div>" + extraScript);
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
// /fxq 路由接管：服务端按身份注入 lockVip 开关
// - 会员（premium_entitlements.status=active）：lockVip=false，全部棋盘版本解锁
// - 免费登录用户 / 游客：lockVip=true，仅基础版 + 恋爱版
// - 游客每日 1 次（后端 IP 计数），用完返回引导页（登录 / 升级会员）
// 模板来自 lib/fxq_html.ts（由 static/fxq/index.html JSON 内嵌 + __LOCKVIP__ 占位符生成）
import { Handlers } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../lib/userAuth.ts";
import {
  clientIpFromRequest,
  getGuestQuota,
  isMember,
  recordGuestPlay,
} from "../lib/gameAccess.ts";
import { FXQ_HTML } from "../lib/fxq_html.ts";

const LOCKED_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>情侣飞行棋</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:linear-gradient(180deg,#fdf2f8,#f3e8ff,#fff); font-family:system-ui,sans-serif; }
  .box { text-align:center; padding:2.5rem 2rem; max-width:24rem; }
  h1 { font-size:1.5rem; color:#be185d; margin:0 0 .5rem; }
  p { color:#6b7280; margin:.25rem 0; }
  .btn { display:inline-block; margin:.5rem .25rem 0; padding:.7rem 1.4rem; border-radius:9999px;
         font-weight:600; text-decoration:none; }
  .btn-pink { background:#ec4899; color:#fff; }
  .btn-ghost { border:1px solid #f9a8d4; color:#db2777; }
</style>
</head>
<body>
  <div class="box">
    <div style="font-size:3rem">🎲</div>
    <h1>今日免费体验已用完</h1>
    <p>游客每天可体验 1 次飞行棋，明天再来～</p>
    <p>登录后不限次数畅玩基础版和恋爱版</p>
    <a class="btn btn-pink" href="/login">登录 / 注册</a>
    <a class="btn btn-ghost" href="/premium">升级会员解锁全部版本</a>
  </div>
</body>
</html>`;

export const handler: Handlers = {
  async GET(req) {
    const username = getUsernameFromRequest(req);
    if (username) {
      // 登录用户：会员全开（locked=false）；免费用户锁定高级版本（基础 + 恋爱可玩）
      const member = await isMember(username);
      return render(FXQ_HTML, !member);
    }
    // 游客：每日 1 次（后端 IP 计数），用完显示引导页
    const ip = clientIpFromRequest(req);
    const quota = await getGuestQuota(ip, "fxq", 1);
    if (quota.remaining <= 0) {
      return new Response(LOCKED_HTML, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
    await recordGuestPlay(ip, "fxq", 1);
    // 游客与免费用户一致：锁定高级版本，可玩基础版 + 恋爱版
    return render(FXQ_HTML, true);
  },
};

function render(template: string, locked: boolean): Response {
  const body = template
    // 按身份改写 lockVip 开关（游戏加载前读取）
    .replace("__LOCKVIP__", locked ? "true" : "false")
    // 静态资源相对路径 ./static/ → /fxq/static/（src 属性为无引号写法，兼容引号形式）
    .replace(/=(["']?)\.\/static\//g, "=$1/fxq/static/");
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
