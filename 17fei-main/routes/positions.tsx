import { Head } from "$fresh/runtime.ts";

import PositionList from "../islands/position-list.tsx";
import { positions } from "../lib/positions.ts";

const SITE_URL = "https://couples-game.website";

// 常见问题（同时用于可见区块与 FAQPage 结构化数据，两处文案必须一致）
const FAQ = [
  {
    q: "情侣姿势大全收费吗？",
    a: "完全免费。完整图鉴的 100 个姿势全部开放查看，不需要购买会员，也没有隐藏收费。",
  },
  {
    q: "一共收录多少个姿势？",
    a: "当前收录 100 个双人互动姿势，按名称与编号排序，可以使用搜索框按关键词筛选。",
  },
  {
    q: "查看姿势大全需要注册或登录吗？",
    a: "不需要。打开页面即可浏览全部条目，只有想保存自己的记录时才需要登录。",
  },
  {
    q: "每个姿势都有示意图吗？",
    a: "每个条目都预留了示意图位置并附有文字说明与难度标签，部分示意图仍在陆续补充中，补充完成后会自动显示。",
  },
  {
    q: "手机上可以看吗？要下载 App 吗？",
    a: "可以。手机和电脑浏览器都能直接打开，页面自适应屏幕，无需下载任何 App。",
  },
];

export default function Positions() {
  const canonical = SITE_URL + "/positions";
  const title = "情侣姿势大全 - 100 个双人互动姿势图鉴（免费查看）";
  const description =
    "情侣姿势大全完整图鉴，收录 100 个双人互动姿势参考卡片并配示意图，可按名称检索查看，全部免费开放、无需注册。";

  // 说明：title / description / canonical / og / twitter 由 routes/_app.tsx 的 SEO_MAP 统一输出。
  // 此处只负责本页独有的结构化数据，避免同一份 meta 在页面上重复出现两次。
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "情侣姿势大全",
    description,
    numberOfItems: positions.length,
    itemListElement: positions.slice(0, 100).map((p: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      name: (p && (p.name || p.title)) || "姿势 " + (i + 1),
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>
      <div class="min-h-screen bg-gradient-to-b from-pink-50 to-white px-3 py-6">
        <div class="mx-auto w-full max-w-5xl">
          <h1 class="text-center text-2xl font-bold text-pink-700 mb-4">
            情侣姿势大全 - 100 个双人互动姿势图鉴
          </h1>
          <PositionList positions={positions} />

          <section class="mt-10 rounded-2xl bg-white p-6 shadow-sm text-left">
            <h2 class="text-xl font-bold text-pink-700 mb-3">常见问题</h2>
            {FAQ.map((f, i) => (
              <div key={i} class="mb-4 last:mb-0">
                <h3 class="text-base font-semibold text-gray-900 mb-1">
                  {f.q}
                </h3>
                <p class="text-sm leading-7 text-gray-600 m-0">{f.a}</p>
              </div>
            ))}
            <h2 class="text-xl font-bold text-pink-700 mt-8 mb-3">
              其他免费玩法
            </h2>
            <ul class="text-sm leading-7 text-gray-600 list-disc pl-5 m-0">
              <li>
                <a href="/fxq" class="text-pink-600 underline">
                  情侣飞行棋
                </a>
                ：双人在线掷骰子互动小游戏。
              </li>
              <li>
                <a href="/card" class="text-pink-600 underline">
                  情侣任务卡牌
                </a>
                ：抽卡完成浪漫任务，10 个主题版本。
              </li>
              <li>
                <a href="/position" class="text-pink-600 underline">
                  情侣姿势卡牌
                </a>
                ：100 个姿势随机抽取。
              </li>
              <li>
                <a href="/" class="text-pink-600 underline">
                  返回首页
                </a>
                ，查看全部游戏。
              </li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
