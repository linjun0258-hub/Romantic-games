import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../lib/userAuth.ts";

// 无需登录即可访问的路径（精确匹配：完整等于才放行）
const PUBLIC_EXACT = [
  // 新首页：营销落地页，游客可见（已登录访问 / 会跳转 /hall）
  "/",
  "/login",
  "/register",
  // 定价页自身公开（未登录用户可见"登录后开通"提示）
  "/premium",
  "/privacy",
  "/terms",
  // 关于页：新首页页脚入口，游客可直接查看
  "/about",
  // 游戏页公开：游客限额试玩，登录/会员解锁更多（各页面服务端自行鉴权与计数）
  "/fxq",
  "/card",
  "/position",
  // 首页/游戏页所需静态资源
  "/logo.png",
  "/favicon.ico",
  "/card.js",
  "/card.css",
  "/tasks.js",
  "/Gold2.wav",
  "/positions.js",
  "/stat.js",
  "/demo.jpeg",
  "/qrcode.JPG",
];

// 前缀匹配：等于前缀，或以「前缀 + /」开头即放行
const PUBLIC_PREFIX = [
  // /api/auth/* 必须公开：会话查询(  // 登录子路由公开：/login/google 为 Google OAuth 发起入口（游客无会话），必须放行；
  // 若只在 PUBLIC_EXACT 精确放行 /login，/login/google 会被本中间件弹回 /login，OAuth 无法发起
  "/login",

  // 以及 Google OAuth 回调(/api/auth/callback/google，Google 跳回时浏览器尚未持有会话 Cookie)
  "/api/auth",
  // Creem 支付回调：Creem 服务器直连 webhook，无浏览器会话，必须公开
  "/api/creem/webhook",
  // 游客试玩限额计数 API（游客无会话，需公开）
  "/api/game-access",
  // 飞行棋游戏静态资源（预编译 uni-app；/fxq 路由本身负责会话注入与游客限额）
  "/fxq",
  // Fresh 客户端 island 产物（公开页面上的 island 需要加载）
  "/_frsh",
  // 公开游戏页依赖的基础库（jQuery / howler）
  "/js",
];

export async function handler(
  request: Request,
  ctx: MiddlewareHandlerContext,
) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 旧飞行棋静态入口统一重定向到会话感知路由（按 游客/免费/会员 注入 lockVip）
  if (pathname === "/fxq/index.html" || pathname === "/fxq/") {
    return new Response(null, {
      status: 307,
      headers: { Location: "/fxq" },
    });
  }

  const isPublic = PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PREFIX.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!isPublic) {
    const username = getUsernameFromRequest(request);
    if (!username) {
      // 未登录：重定向到登录页
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" },
      });
    }
  }
  const response = await ctx.next();
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}
