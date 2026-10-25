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

// FAQ 内容：既用于页面可见区域，也同步输出 FAQPage 结构化数据
// 让搜索引擎与 AI 搜索（ChatGPT / Perplexity / 豆包 / Kimi 等）都能直接引用答案
const FAQS = [
  {
    q: "情侣飞行棋是什么？怎么玩？",
    a: "情侣飞行棋是一款面向情侣的在线互动小游戏。两个人轮流掷骰子沿棋盘前进，落在不同格子会触发任务卡、真心话或甜蜜互动事件，先到达终点的一方获胜。全程在网页里完成，不需要下载 App，手机和电脑都能玩。",
  },
  {
    q: "情侣飞行棋要收费吗？需要开通会员吗？",
    a: "完全免费。所有游戏、所有版本（基础版、恋爱版、情侣版、高级版、私密版、自定义模式）全部开放，没有会员、没有订阅、没有隐藏收费，也不需要付费解锁任何内容。",
  },
  {
    q: "两个人异地可以一起玩吗？",
    a: "可以。打开同一个网页即可双人同玩，异地情侣可以开视频通话，一边视频一边按网页提示轮流操作，体验和面对面基本一致。",
  },
  {
    q: "需要注册账号吗？",
    a: "大部分游戏（飞行棋、任务卡牌、姿势卡牌、姿势大全）打开网页就能直接玩，不注册也可以。注册账号只是为了保存你的游戏记录与偏好设置，同样免费。",
  },
  {
    q: "情侣飞行棋有哪些游戏模式？",
    a: "目前提供飞行棋的六个模式（基础版、恋爱版、情侣版、高级版、私密版、自定义模式），另有 10 个主题版本的任务卡牌、100 个姿势的姿势卡牌随机抽取，以及完整的姿势大全图鉴。",
  },
  {
    q: "适合什么阶段的情侣玩？",
    a: "因为有多档模式，刚在一起的情侣可以从基础版、恋爱版开始，相处较久的情侣可以选择情侣版或更高阶的模式。所有模式都免费，可以自行选择舒服的节奏。",
  },
];

const SITE = "https://couples-game.website";

function buildPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": SITE + "/#app",
        name: "情侣飞行棋",
        applicationCategory: "GameApplication",
        operatingSystem: "Web",
        url: SITE + "/",
        inLanguage: "zh-CN",
        description:
          "情侣互动在线小游戏，包含飞行棋、任务卡牌与姿势卡牌，全部免费，无需下载。",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CNY",
          availability: "https://schema.org/InStock",
        },
        featureList: FREE_FEATURES,
      },
      {
        "@type": "FAQPage",
        "@id": SITE + "/#faq",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      },
    ],
  };
}

export default function Home() {
  return (
    <div class="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPageJsonLd()) }}
      />

      {/* 顶部导航 */}
      <header class="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="情侣飞行棋 logo" class="h-8 w-8 rounded" />
          <span class="text-lg font-bold text-pink-600">情侣飞行棋</span>
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
          情侣飞行棋 —— 和另一半一起玩的
          <span class="text-pink-500">在线互动小游戏</span>
        </h1>
        <p class="text-gray-500 mb-4">
          旅行棋、任务卡牌、姿势卡牌，打开网页就能双人同玩
        </p>
        <p class="text-emerald-600 font-medium mb-8">
          🎉 全部游戏、全部版本，永久免费，无需下载
        </p>
        <div class="flex items-center justify-center gap-4">
          <a
            href="/fxq"
            class="px-6 py-3 rounded-full bg-pink-500 text-white font-medium hover:bg-pink-600"
          >
            立即开始玩
          </a>
          <a
            href="/register"
            class="px-6 py-3 rounded-full border border-pink-300 text-pink-600 hover:bg-pink-50"
          >
            免费注册
          </a>
        </div>
      </section>

      {/* 游戏卡片 */}
      <section class="max-w-5xl mx-auto px-4 pb-16">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
          全部游戏，全部免费
        </h2>
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
              <h3 class="font-bold text-gray-800 mb-1">{g.name}</h3>
              <div class="text-sm text-gray-500">{g.desc}</div>
            </a>
          ))}
        </div>
      </section>

      {/* 免费说明 */}
      <section id="pricing" class="max-w-3xl mx-auto px-4 pb-16">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
          价格：全部免费
        </h2>
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

      {/* 常见问题：GEO 关键区块，问答式结构便于被 AI 搜索直接引用 */}
      <section id="faq" class="max-w-3xl mx-auto px-4 pb-20">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
          常见问题
        </h2>
        <div class="space-y-3">
          {FAQS.map((f) => (
            <details
              class="bg-white rounded-xl border border-pink-100 p-5"
              open={false}
            >
              <summary class="font-semibold text-gray-800 cursor-pointer list-none">
                <h3 class="inline">{f.q}</h3>
              </summary>
              <p class="mt-3 text-sm leading-relaxed text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer class="border-t border-pink-100 py-6 text-center text-sm text-gray-400">
        <div class="max-w-5xl mx-auto flex items-center justify-center gap-4">
          <a href="/about" class="hover:text-gray-600">关于我们</a>
          <a href="/privacy" class="hover:text-gray-600">隐私政策</a>
          <a href="/terms" class="hover:text-gray-600">服务条款</a>
        </div>
      </footer>
    </div>
  );
}
