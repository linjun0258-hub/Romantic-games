// /premium 页面：现已全部免费，本页不再提供任何付费入口
// 保留该路由只为兼容旧链接，避免 404；页面仅说明「全部功能免费」
// SEO 说明：title / description / canonical / og / twitter 由 routes/_app.tsx 的 SEO_MAP 输出，
// 此处只补充本页独有的 FAQ 可见内容与 FAQPage 结构化数据。
import { Head } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";

// 常见问题（可见区块与 FAQPage 结构化数据共用同一份文案）
const FAQ = [
  {
    q: "现在还需要购买会员吗？",
    a: "不需要。站内所有游戏、所有版本都已经免费开放，没有任何付费入口，也不需要开通会员或订阅。",
  },
  {
    q: "全部免费后功能会减少吗？",
    a: "不会。飞行棋多个模式、任务卡牌全部主题版本、姿势卡牌与姿势大全都保持完整可用，新版本上线即免费体验。",
  },
  {
    q: "免费使用需要注册账号吗？",
    a: "不强制注册。直接用浏览器打开网页就能玩，只有想保存自己的记录或进度时才需要登录。",
  },
  {
    q: "具体有哪些玩法是免费的？",
    a: "情侣飞行棋全部版本、任务卡牌 10 个主题版本、姿势卡牌 100 个姿势，以及 100 个姿势的完整图鉴，全部免费。",
  },
  {
    q: "之前买过付费内容怎么办？",
    a: "本页面不再提供任何付费订阅服务。如对历史订单或账号有疑问，可以通过页面底部的邮箱联系我们。",
  },
];

export default function PremiumPage() {
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
    <div class="min-h-screen bg-gray-100 px-4 py-12">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>
      <div class="mx-auto max-w-xl">
        <h1 class="text-center text-3xl font-bold text-pink-700">
          全部免费，无需会员
        </h1>
        <p class="mt-2 text-center text-sm text-pink-600">
          所有游戏、所有版本都已经免费开放，不再需要购买任何会员
        </p>

        <div class="mt-8 rounded-2xl bg-white p-8 shadow-lg">
          <div class="text-center">
            <div class="text-4xl">🎉</div>
            <div class="mt-3 text-2xl font-bold text-emerald-600">
              免费 · ¥0
            </div>
            <div class="mt-1 text-xs text-gray-400">
              永久免费，无隐藏收费，无需注册会员
            </div>
          </div>

          <ul class="mt-8 space-y-2 text-sm text-gray-600">
            <li>✅ 情侣飞行棋：全部版本无限次畅玩</li>
            <li>✅ 任务卡牌：10 个主题版本全部解锁</li>
            <li>✅ 姿势卡牌：100 个浪漫姿势不限次数</li>
            <li>✅ 姿势大全：完整图鉴免费查看</li>
            <li>✅ 新版本上线即免费体验</li>
          </ul>

          <a
            href="/hall"
            class="mt-8 block w-full rounded-full bg-pink-500 px-6 py-3 text-center text-lg font-semibold text-white shadow hover:bg-pink-600"
          >
            直接开始玩
          </a>

          <a
            href="/"
            class="mt-3 block w-full rounded-full border border-pink-300 px-6 py-3 text-center text-sm font-medium text-pink-600 hover:bg-pink-50"
          >
            返回首页
          </a>
        </div>

        <section class="mt-8 rounded-2xl bg-white p-8 shadow-lg">
          <h2 class="text-lg font-bold text-pink-700 mb-3">常见问题</h2>
          {FAQ.map((f, i) => (
            <div key={i} class="mb-4 last:mb-0">
              <h3 class="text-base font-semibold text-gray-900 mb-1">{f.q}</h3>
              <p class="text-sm leading-7 text-gray-600 m-0">{f.a}</p>
            </div>
          ))}
        </section>

        <p class="mt-6 text-center text-xs text-gray-400">
          本页面不再提供任何付费订阅服务。如有问题请联系
          <a href="mailto:linjun0258@gmail.com" class="underline">
            linjun0258@gmail.com
          </a>
          。
        </p>

        <Footer />
      </div>
    </div>
  );
}
