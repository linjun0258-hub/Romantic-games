// 首页：公开落地页，全部游戏所有版本完全免费，取消会员与付费
// 已登录用户 302 → /hall 独立大厅
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
    desc: "和对象一起掷骰子完成任务，全部版本免费",
    tag: "免费",
  },
  {
    href: "/card",
    icon: "🃏",
    name: "任务卡牌",
    desc: "10 个主题版本随机任务，随便抽",
    tag: "免费",
  },
  {
    href: "/position",
    icon: "💗",
    name: "姿势卡牌",
    desc: "100 个浪漫姿势随机抽，不限次数",
    tag: "免费",
  },
  {
    href: "/positions",
    icon: "📖",
    name: "姿势大全",
    desc: "完整姿势图鉴一览，免费查看",
    tag: "免费",
  },
];

const FREE_FEATURES = [
  "全部游戏、全部版本无限次畅玩",
  "全部主题棋盘与事件卡全解锁",
  "姿势大全完整图鉴免费查看",
  "新版本上线即免费体验",
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
        <p class="text-gray-500 mb-4">
          飞行棋 · 任务卡牌 · 姿势卡牌，让每一天都更甜一点
        </p>
        <p class="text-emerald-600 font-medium mb-8">
          🎉 全部游戏、全部版本，永久免费
        </p>
        <div class="flex items-center justify-center gap-4">
          <a
            href="/register"
            class="px-6 py-3 rounded-full bg-pink-500 text-white font-medium hover:bg-pink-600"
          >
            免费开始玩
          </a>
          <a
            href="/fxq"
            class="px-6 py-3 rounded-full border border-pink-300 text-pink-600 hover:bg-pink-50"
          >
            直接进入游戏
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
                <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {g.tag}
                </span>
              </div>
              <div class="font-bold text-gray-800 mb-1">{g.name}</div>
              <div class="text-sm text-gray-500">{g.desc}</div>
            </a>
          ))}
        </div>
      </section>

      {/* 免费说明 */}
      <section id="pricing" class="max-w-3xl mx-auto px-4 pb-20">
        <div class="bg-gradient-to-b from-emerald-400 to-teal-500 rounded-2xl p-8 text-white text-center">
          <div class="text-lg font-bold mb-1">全部免费</div>
          <div class="text-3xl font-extrabold mb-6">
            ¥0<span class="text-base font-normal"> / 永久</span>
          </div>
          <ul class="space-y-3 text-sm text-emerald-50 text-left max-w-md mx-auto mb-8">
            {FREE_FEATURES.map((f) => (
              <li class="flex gap-2">
                <span>✓</span>
                {f}
              </li>
            ))}
          </ul>
          <a
            href="/fxq"
            class="inline-block px-6 py-3 rounded-full bg-white text-emerald-600 font-bold hover:bg-emerald-50"
          >
            立即开玩
          </a>
        </div>
        <p class="text-center text-xs text-gray-400 mt-6">
          无需购买任何会员 · 无隐藏收费 · 直接开始玩
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
