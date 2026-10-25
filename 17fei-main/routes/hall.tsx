// 登录后独立大厅：所有游戏、所有版本全部免费，不再有会员概念
import { Handlers, PageProps } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../lib/userAuth.ts";

interface HallData {
  username: string;
}

export const handler: Handlers<HallData> = {
  async GET(req, ctx) {
    const username = getUsernameFromRequest(req);
    if (!username) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" },
      });
    }
    return ctx.render({ username });
  },
};

const GAMES = [
  {
    href: "/fxq",
    icon: "🎲",
    name: "情侣飞行棋",
    desc: "基础版 / 恋爱版 / 更多主题棋盘，全部解锁",
  },
  {
    href: "/card",
    icon: "🃏",
    name: "任务卡牌",
    desc: "10 个主题版本随机任务，全部可玩",
  },
  {
    href: "/position",
    icon: "💗",
    name: "姿势卡牌",
    desc: "100 个浪漫姿势随机抽，不限次数",
  },
  {
    href: "/positions",
    icon: "📖",
    name: "姿势大全",
    desc: "完整姿势图鉴一览，免费查看",
  },
];

export default function Hall({ data }: PageProps<HallData>) {
  return (
    <div class="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      <header class="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="logo" class="h-8 w-8 rounded" />
          <span class="text-lg font-bold text-pink-600">情侣游戏 · 大厅</span>
        </div>
        <div class="flex items-center gap-3 text-sm">
          <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
            全部免费
          </span>
          <a
            href="/api/auth/signout"
            class="px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            退出登录
          </a>
        </div>
      </header>

      <main class="max-w-5xl mx-auto px-4 pb-16">
        <h1 class="text-2xl font-bold text-gray-800 mt-6 mb-1">
          欢迎，{data.username} 💕
        </h1>
        <p class="text-gray-500 mb-8">
          全部游戏、全部版本已免费开放，无限畅玩，无需开通任何会员
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAMES.map((g) => (
            <a
              key={g.href}
              href={g.href}
              class="relative block bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-pink-100"
            >
              <div class="text-4xl mb-3">{g.icon}</div>
              <div class="font-bold text-gray-800 mb-1">{g.name}</div>
              <div class="text-sm text-gray-500">{g.desc}</div>
            </a>
          ))}
        </div>

        <div class="mt-10 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl p-6 text-white">
          <div class="font-bold text-lg mb-1">全部免费开放中 🎉</div>
          <div class="text-sm text-emerald-50">
            所有游戏版本不限次数、无需付费，直接开始玩就好
          </div>
        </div>
      </main>
    </div>
  );
}
