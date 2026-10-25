import { Head } from "$fresh/runtime.ts";

export default function Card() {
  return (
    <>
      <Head>
        <link href="/card.css" rel="stylesheet"></link>
        <script src="/js/jquery.min.js"></script>
        <script src="/js/howler.min.js"></script>
        <script src="/tasks.js"></script>
        <script src="/card.js"></script>
        <title>情侣任务卡牌游戏 - 抽取浪漫任务卡（免费在线玩）</title>
      </Head>
      <div class="w-full leading-8 min-h-screen text-shadow bg-pink-400 text-lg text-red-100">
        <div class="max-w-screen-md mx-auto ">
          <div class="p-2 flex items-center w-full">
            <a class="flex-1" href="/">
              <img src="/logo.png" class="w-12 h-12" />
            </a>
            <div class="flex-auto text-center">
              <span id="title">基础版</span>任务卡牌
            </div>
            <div class="flex-1 text-right">
              <a
                class="p-2 bg-pink-600 border text-sm whitespace-nobreak rounded"
                href="/card_version"
              >
                选择版本
              </a>
            </div>
          </div>
          <div class="flex my-4 justify-center">
            <input type="checkbox" id="card" checked />
            <label for="card">
              <div class="cardWrapper ">
                <div class="cardRandom h-full flex flex-col items-center">
                  <div class="flex-1"></div>
                  <div
                    id="content"
                    style="writing-mode: vertical-rl"
                    class="p-4 flex-auto font-black text-3xl text-pink-600"
                  >
                  </div>
                  <div class="flex-1"></div>
                </div>
              </div>
            </label>
          </div>
          <div class="text-center">基本玩法：</div>
          <div class="text-center">轮流抽卡完成任务, 无法完成认输受惩罚</div>
        </div>
      </div>
      <section class="max-w-screen-md mx-auto mt-10 mb-8 px-4">
        <div class="bg-white text-gray-800 rounded-2xl p-6 leading-8 text-left shadow">
          <h1 class="text-2xl font-extrabold text-pink-700 mb-4 leading-snug">
            情侣任务卡牌：抽卡完成浪漫任务，免费在线玩
          </h1>
          <p class="mb-3">
            情侣任务卡牌是一款比飞行棋更轻量的双人互动小游戏。整副牌就是一叠任务卡，点一下抽一张，抽到什么就做什么：可能是一句告白、一个提问，也可能是一个需要在现场完成的小动作。因为不需要棋盘、不用掷骰子，随手打开就能玩，很适合刚开始互动、还放不太开的两个人。
          </p>
          <p class="mb-5">
            目前站内提供 10 个不同主题的版本，从基础版、恋爱版到私密版，全部免费开放，无需购买会员。
          </p>

          <h2 class="text-lg font-bold text-pink-700 mt-6 mb-2">怎么玩？</h2>
          <ol class="list-decimal pl-6 mb-4 space-y-1">
            <li>两个人坐在一起，打开同一张卡牌页面。</li>
            <li>轮流点击卡牌，随机抽出一张任务卡。</li>
            <li>抽到的人按卡面提示完成任务，或者把问题回答出来。</li>
            <li>无法完成的按约定接受一个小惩罚，然后换下一位抽卡。</li>
          </ol>
          <p class="mb-5">没有固定回合数，想玩几张就玩几张，随时可以停下。</p>

          <h2 class="text-lg font-bold text-pink-700 mt-6 mb-2">适合什么场景玩？</h2>
          <ul class="list-disc pl-6 mb-5 space-y-1">
            <li>异地恋打视频时，比各自刷手机更有互动感。</li>
            <li>刚在一起不久，想找点话题又不想太刻意。</li>
            <li>纪念日、生日、情人节想制造一点仪式感。</li>
            <li>长期关系中想重新找回一些新鲜感。</li>
          </ul>

          <h2 class="text-lg font-bold text-pink-700 mt-6 mb-3">常见问题</h2>
          <h3 class="font-bold mt-4 mb-1">情侣任务卡牌要付费吗？</h3>
          <p class="mb-3">不需要。当前全部 10 个主题版本都免费开放，没有付费解锁，也没有隐藏收费。</p>
          <h3 class="font-bold mt-4 mb-1">一共有多少个版本？</h3>
          <p class="mb-3">
            共 10 个主题版本，包括基础版、恋爱版、热恋版等。
            <a href="/card_version" class="text-pink-600 underline">查看全部版本</a>
            后可以直接进入想玩的那一个。
          </p>
          <h3 class="font-bold mt-4 mb-1">需要注册或下载吗？</h3>
          <p class="mb-3">都不需要。浏览器打开网页就能抽卡，手机和电脑都支持。</p>
          <h3 class="font-bold mt-4 mb-1">抽到的任务可以跳过吗？</h3>
          <p class="mb-5">可以。跳过就按你们事先约好的惩罚来，这也是游戏的一部分。</p>

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
                "name": "情侣任务卡牌要付费吗？",
                "acceptedAnswer": { "@type": "Answer", "text": "不需要。当前全部 10 个主题版本都免费开放，没有付费解锁，也没有隐藏收费。" },
              },
              {
                "@type": "Question",
                "name": "一共有多少个版本？",
                "acceptedAnswer": { "@type": "Answer", "text": "共 10 个主题版本，包括基础版、恋爱版、热恋版等，可在版本列表页直接选择想玩的一个。" },
              },
              {
                "@type": "Question",
                "name": "需要注册或下载吗？",
                "acceptedAnswer": { "@type": "Answer", "text": "都不需要。浏览器打开网页就能抽卡，手机和电脑都支持。" },
              },
              {
                "@type": "Question",
                "name": "抽到的任务可以跳过吗？",
                "acceptedAnswer": { "@type": "Answer", "text": "可以。跳过就按你们事先约好的惩罚来，这也是游戏的一部分。" },
              },
            ],
          }),
        }}
      />
    </>
  );
}
