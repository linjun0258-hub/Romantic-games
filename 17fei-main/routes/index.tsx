// 新首页：公开营销落地页（游客可见），底部免费 vs 会员定价表
// 已登录用户 302 → /hall 独立大厅；购买按钮 → /premium（现有「登录后开通」流程，未登录由 /premium 引导）
import { Handlers } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../lib/userAuth.ts";

export const handler: Handlers = {
  GET(req, ctx) {
    const username = getUsernameFromRequest(req);
    if (username) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/hall" },
      });
    }
    return ctx.render();
  },
};

const GAMES = [
  {
    href: "/fxq",
    icon: "🎲",
    name: "情侣飞行棋",
    desc: "和对象一起掷骰子完成任务，基础版免费体验",
    tag: "免费试玩",
  },
  {
    href: "/card",
    icon: "🃏",
    name: "任务卡牌",
    desc: "恋爱版免费体验，10 个主题版本会员解锁",
    tag: "恋爱版免费",
  },
  {
    href: "/position",
    icon: "💗",
    name: "姿势卡牌",
    desc: "100 个浪漫姿势随机抽，每天免费 3 次",
    tag: "每日 3 抽",
  },
  {
    href: "/positions",
    icon: "📖",
    name: "姿势大全",
    desc: "完整姿势图鉴一览",
    tag: "会员专享",
  },
];

const FREE_FEATURES = [
  "情侣飞行棋：基础版 / 恋爱版（游客每日 1 次）",
  "任务卡牌：恋爱版（游客每日 3 抽）",
  "姿势卡牌：游客每日 3 抽",
  "注册登录后不限抽卡次数",
];

const PREMIUM_FEATURES = [
  "全部游戏版本无限次畅玩",
  "解锁全部主题棋盘与事件卡",
  "无限房间与好友对战",
  "专属情侣任务与纪念日提醒",
];

export default function Home() {
  return (
    <div class="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      {/* 顶部导航 */}
      <header class="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="情侣游戏" class="h-8 w-8 rounded" />
          <span class="text-lg font-bold text-pink-600">情侣游戏</span>
        </div>
        <nav class="flex items-center gap-3 text-sm">
          <a
            href="/login"
            class="px-4 py-2 rounded-full border border-pink-300 text-pink-600 hover:bg-pink-50"
          >
            登录
          </a>
          <a
            href="/register"
            class="px-4 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600"
          >
            免费注册
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section class="max-w-5xl mx-auto px-4 pt-10 pb-12 text-center">
        <h1 class="text-4xl font-extrabold text-gray-800 mb-4">
          和另一半一起玩的<span class="text-pink-500">情侣小游戏</span>
        </h1>
        <p class="text-gray-500 mb-8">
          飞行棋 · 任务卡牌 · 姿势卡牌，让每一天都更甜一点
        </p>
        <div class="flex items-center justify-center gap-4">
          <a
            href="/register"
            class="px-6 py-3 rounded-full bg-pink-500 text-white font-medium hover:bg-pink-600"
          >
            免费开始玩
          </a>
          <a
            href="/premium"
            class="px-6 py-3 rounded-full border border-pink-300 text-pink-600 hover:bg-pink-50"
          >
            查看会员
          </a>
        </div>
      </section>

      {/* 游戏卡片 */}
      <section class="max-w-5xl mx-auto px-4 pb-16">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAMES.map((g) => (
            <a
              key={g.href}
              href={g.href}
              class="block bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-pink-100"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-4xl">{g.icon}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-600">
                  {g.tag}
                </span>
              </div>
              <div class="font-bold text-gray-800 mb-1">{g.name}</div>
              <div class="text-sm text-gray-500">{g.desc}</div>
            </a>
          ))}
        </div>
      </section>

      {/* 定价表 */}
      <section id="pricing" class="max-w-4xl mx-auto px-4 pb-20">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-8">
          选择你的方案
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl border border-gray-200 p-8">
            <div class="text-lg font-bold text-gray-800 mb-1">免费版</div>
            <div class="text-3xl font-extrabold text-gray-800 mb-6">$0</div>
            <ul class="space-y-3 text-sm text-gray-600 mb-8">
              {FREE_FEATURES.map((f) => (
                <li class="flex gap-2">
                  <span class="text-pink-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/register"
              class="block text-center px-5 py-3 rounded-full border border-pink-300 text-pink-600 hover:bg-pink-50 font-medium"
            >
              免费注册
            </a>
          </div>
          <div class="bg-gradient-to-b from-pink-500 to-purple-500 rounded-2xl p-8 text-white relative">
            <span class="absolute top-6 right-6 text-xs px-2 py-0.5 rounded-full bg-white text-pink-600 font-medium">
              最受欢迎
            </span>
            <div class="text-lg font-bold mb-1">会员</div>
            <div class="text-3xl font-extrabold mb-1">
              $4.99<span class="text-base font-normal">/月</span>
            </div>
            <div class="text-sm text-pink-100 mb-6">无限次玩所有版本</div>
            <ul class="space-y-3 text-sm text-pink-50 mb-8">
              {PREMIUM_FEATURES.map((f) => (
                <li class="flex gap-2">
                  <span>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/premium"
              class="block text-center px-5 py-3 rounded-full bg-white text-pink-600 font-bold hover:bg-pink-50"
            >
              开通会员
            </a>
          </div>
        </div>
        <p class="text-center text-xs text-gray-400 mt-6">
          开通即表示同意{" "}
          <a href="/terms" class="underline">服务条款</a>{" "}
          与{" "}
          <a href="/privacy" class="underline">隐私政策</a>{" "}
          · 随时取消
        </p>
      </section>

      <footer class="border-t border-pink-100 py-6 text-center text-sm text-gray-400">
        <div class="max-w-5xl mx-auto flex items-center justify-center gap-4">
          <a href="/privacy" class="hover:text-gray-600">隐私政策</a>
          <a href="/terms" class="hover:text-gray-600">服务条款</a>
        </div>
      </footer>
    </div>
  );
}
