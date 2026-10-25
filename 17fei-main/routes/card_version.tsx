import { Head } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";

export default function CardVersion() {
  return (
    <>
      <Head>
        <link href="/card.css" rel="stylesheet"></link>
        <script src="/js/jquery.min.js"></script>
        <script src="/card_version.js"></script>
      </Head>

      <div class="w-full leading-8 min-h-screen text-shadow bg-pink-400 text-lg text-red-100">
        <div class="max-w-screen-md text-center mx-auto ">
          <div class="p-2 flex items-center w-full">
            <a class="flex-1" href="/">
              <img src="/logo.png" class="w-12 h-12" />
            </a>
          </div>

          <div class="max-w-md mx-auto p-4">
            <div class="font-black my-4">选择任务卡组合</div>
            <div class="">
              <div
                onClick="changeVersion('lover0')"
                class="p-2 cursor-pointer bg-pink-600 rounded border mt-4"
              >
                恋爱版
              </div>
              <div
                onClick="changeVersion('lover1')"
                class="p-2 cursor-pointer bg-pink-600 rounded border mt-4"
              >
                热恋版
              </div>
              <div
                onClick="changeVersion('sex0')"
                class="p-2 cursor-pointer bg-pink-600 rounded border mt-4"
              >
                同居
              </div>
              <div
                onClick="changeVersion('sex1')"
                class="p-2 cursor-pointer bg-pink-600 rounded border mt-4"
              >
                进阶版
              </div>
              <div
                onClick="changeVersion('sex2')"
                class="p-2 cursor-pointer bg-pink-600 rounded border mt-4"
              >
                私密版
              </div>
              <div
                onClick="changeVersion('sm')"
                class="p-2 cursor-pointer bg-pink-600 rounded border mt-4"
              >
                SM版(秘)
              </div>
              <div
                onClick="changeVersion('huwai')"
                class="p-2 cursor-pointer bg-pink-600 rounded border mt-4"
              >
                户外版(秘)
              </div>
              <div
                onClick="changeVersion('nvpu')"
                class="p-2 cursor-pointer bg-pink-600 rounded border mt-4"
              >
                男扑版(秘)
              </div>
              <div
                onClick="changeVersion('nanpu')"
                class="p-2 cursor-pointer bg-pink-600 rounded border mt-4"
              >
                女扑版(秘)
              </div>
              <div
                onClick="changeVersion('custom')"
                class="p-2 cursor-pointer bg-pink-600 rounded border mt-4"
              >
                自定义(秘)
              </div>
            </div>
          </div>
        </div>

        <Footer></Footer>
      </div>
      <section class="max-w-screen-md mx-auto mt-10 mb-8 px-4">
        <div class="bg-white text-gray-800 rounded-2xl p-6 leading-8 text-left shadow">
          <h1 class="text-2xl font-extrabold text-pink-700 mb-4 leading-snug">
            情侣任务卡牌全部版本：10 个主题免费选，先挑一个开始
          </h1>
          <p class="mb-3">
            这里是情侣任务卡牌的版本列表页。同一套抽卡玩法分成 10 个不同主题，难度、话题方向和适合的人群都不一样，选好一个就能直接进入开始抽卡。不确定从哪个开始的话，建议先玩基础版熟悉规则，再按你们的关系阶段往下换。
          </p>
          <p class="mb-5">
            10 个版本全部免费开放，不需要购买会员，也没有需要解锁的付费内容。
          </p>

          <h2 class="text-lg font-bold text-pink-700 mt-6 mb-2">10 个版本分别适合谁？</h2>
          <ul class="list-disc pl-6 mb-5 space-y-1">
            <li><strong>基础版</strong>：任务最轻、门槛最低，第一次玩选它不会出错。</li>
            <li><strong>恋爱版</strong>：以心动话题和告白类任务为主，适合暧昧期和刚在一起。</li>
            <li><strong>热恋版</strong>：互动更密集、更主动，适合感情正浓的阶段。</li>
            <li><strong>同居版</strong>：围绕日常生活场景设计，适合已经住在一起的情侣。</li>
            <li><strong>进阶版</strong>：任务强度上升，需要一定的默契和信任基础。</li>
            <li><strong>私密版</strong>：更私密的双人场景，请双方自愿并注意界限。</li>
            <li><strong>SM 版</strong>：特定偏好的主题内容，仅适合明确知情同意的成年人。</li>
            <li><strong>户外版</strong>：适合出门约会时玩，注意场合和他人的感受。</li>
            <li><strong>男扑 / 女扑版</strong>：单向出力更多的两种玩法，角色分工不同。</li>
            <li><strong>自定义（秘）</strong>：自己写任务，做成只属于你们的专属牌组。</li>
          </ul>

          <h2 class="text-lg font-bold text-pink-700 mt-6 mb-2">怎么挑版本？</h2>
          <ol class="list-decimal pl-6 mb-5 space-y-1">
            <li>看你们现在的关系阶段：刚开始选基础版或恋爱版，稳定期可以直接进阶。</li>
            <li>看场合：在家选同居版、私密版；出门约会选户外版。</li>
            <li>看接受度：任何一方觉得不合适就换一个，游戏是为了放松，不是为了勉强。</li>
          </ol>

          <h2 class="text-lg font-bold text-pink-700 mt-6 mb-3">常见问题</h2>
          <h3 class="font-bold mt-4 mb-1">10 个版本都要付费吗？</h3>
          <p class="mb-3">都不需要。全部版本目前免费开放，没有会员门槛，也没有单版本解锁。</p>
          <h3 class="font-bold mt-4 mb-1">可以随时换版本吗？</h3>
          <p class="mb-3">可以。任何时候回到这个页面重新选一个版本就能直接开始，不需要重新注册。</p>
          <h3 class="font-bold mt-4 mb-1">不确定选哪个，有推荐吗？</h3>
          <p class="mb-3">
            推荐先玩<a href="/card" class="text-pink-600 underline">基础版</a>，熟悉抽卡节奏之后再按上面的分类挑主题。
          </p>
          <h3 class="font-bold mt-4 mb-1">自定义版本怎么用？</h3>
          <p class="mb-5">进入自定义版后自己填写任务内容，保存后就是一份只属于你们两个人的牌组。</p>

          <h2 class="text-lg font-bold text-pink-700 mt-6 mb-2">其他免费玩法</h2>
          <ul class="list-disc pl-6">
            <li class="mb-1"><a href="/fxq" class="text-pink-600 underline">情侣飞行棋</a>：7 种模式的棋盘互动游戏。</li>
            <li class="mb-1"><a href="/position" class="text-pink-600 underline">情侣姿势卡牌</a>：100 个姿势随机抽取。</li>
            <li class="mb-1"><a href="/positions" class="text-pink-600 underline">情侣姿势大全</a>：完整图鉴免费查看。</li>
            <li><a href="/" class="text-pink-600 underline">返回首页</a>，查看全部游戏。</li>
          </ul>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "10 个版本都要付费吗？",
                "acceptedAnswer": { "@type": "Answer", "text": "都不需要。全部版本目前免费开放，没有会员门槛，也没有单版本解锁。" },
              },
              {
                "@type": "Question",
                "name": "可以随时换版本吗？",
                "acceptedAnswer": { "@type": "Answer", "text": "可以。任何时候回到版本列表重新选一个版本就能直接开始，不需要重新注册。" },
              },
              {
                "@type": "Question",
                "name": "不确定选哪个版本，有推荐吗？",
                "acceptedAnswer": { "@type": "Answer", "text": "推荐先玩基础版，熟悉抽卡节奏之后再按关系阶段和场合挑主题版本。" },
              },
              {
                "@type": "Question",
                "name": "自定义版本怎么用？",
                "acceptedAnswer": { "@type": "Answer", "text": "进入自定义版后自己填写任务内容，保存后就是一份只属于你们两个人的牌组。" },
              },
            ],
          }),
        }}
      />
    </>
  );
}
