// 登录后独立大厅：按身份展示游戏入口与会员状态
import { Handlers, PageProps } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../lib/userAuth.ts";
import { isMember } from "../lib/gameAccess.ts";

interface HallData {
  username: string;
  member: boolean;
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
    const member = await isMember(username);
    return ctx.render({ username, member });
  },
};

const GAMES = [
  {
    href: "/fxq",
    icon: "🎲",
    name: "情侣飞行棋",
    desc: "基础版 / 恋爱版 / 更多主题棋盘",
    memberOnly: false,
  },
  {
    href: "/card",
    icon: "🃏",
    name: "任务卡牌",
    desc: "10 个主题版本随机任务",
    memberOnly: false,
  },
  {
    href: "/position",
    icon: "💗",
    name: "姿势卡牌",
    desc: "100 个浪漫姿势随机抽",
    memberOnly: false,
  },
  {
    href: "/positions",
    icon: "📖",
    name: "姿势大全",
    desc: "完整姿势图鉴一览",
    memberOnly: true,
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
          {data.member
            ? (
              <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                会员
              </span>
            )
            : (
              <a
                href="/premium"
                class="px-3 py-1 rounded-full bg-pink-500 text-white hover:bg-pink-600"
              >
                升级会员 $4.99/月
              </a>
            )}
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
          {data.member
            ? "会员权益已生效：全部版本无限畅玩"
            : "当前为免费版：飞行棋基础版 / 恋爱版可玩，升级解锁全部"}
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAMES.map((g) => (
            <a
              key={g.href}
              href={g.href}
              class="relative block bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-pink-100"
            >
              {g.memberOnly && !data.member && (
                <span class="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  会员
                </span>
              )}
              <div class="text-4xl mb-3">{g.icon}</div>
              <div class="font-bold text-gray-800 mb-1">{g.name}</div>
              <div class="text-sm text-gray-500">{g.desc}</div>
            </a>
          ))}
        </div>

        {!data.member && (
          <div class="mt-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
            <div>
              <div class="font-bold text-lg mb-1">升级会员，无限畅玩全部版本</div>
              <div class="text-sm text-pink-100">$4.99/月 · 随时取消</div>
            </div>
            <a
              href="/premium"
              class="px-5 py-2.5 rounded-full bg-white text-pink-600 font-medium hover:bg-pink-50"
            >
              立即升级
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
