import { Head } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";

export default function Home() {
  return (
    <div class="p-2 w-full leading-8 min-h-screen text-shadow bg-pink-400 text-lg text-red-100">
      <Head>
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      </Head>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold my-16">情侣情趣飞行棋</h1>
        <img src="/logo.png" class="w-16 h-16" alt="情侣情趣飞行棋" />
        <p class="my-4 text-center px-2">
          专为情侣设计的线上互动游戏：掷骰子、抽卡牌、完成甜蜜任务，把两个人的约会变成一场冒险。无需下载，打开网页即可与伴侣一起玩。
        </p>
        <div class="text-left leading-8 font-black mt-4">
          <div>1. 自由定制棋盘内容</div>
          <div>
            2. 预设不同阶段互动内容 恋爱，情趣，好玩。满足各种口味快速开局。
          </div>
          <div>3. 获取源码定制，一键接入自有app小程序, 公众号</div>
        </div>

        <div class="w-full max-w-md text-center mt-8">
          <div class="font-black my-4">包含内容与价格</div>
          <div class="border rounded bg-pink-500 px-4 py-3 my-2">
            免费畅玩：基础棋盘与全部游戏模式，注册即可开玩
          </div>
          <div class="border rounded bg-pink-600 px-4 py-3 my-2">
            Premium 会员：$4.99/月，解锁全部主题棋盘、事件卡、专属情侣任务与纪念日提醒，可随时取消
          </div>
          <a
            href="/premium"
            class="inline-block px-4 py-2 my-2 border rounded bg-pink-600 underline"
          >
            查看会员定价详情
          </a>
        </div>

        <div class="text-center mt-8">
          <div class="font-black my-4">游戏列表</div>
          <a href="/fxq/index.html" class="block px-4 my-4 border rounded bg-pink-600 underline w-60">
            飞行棋
          </a>
          <a href="/card" class="block px-4 my-4 border rounded bg-pink-600 underline w-60">
            任务卡牌
          </a>
          <a href="/position" class="block px-4 my-4 border rounded bg-pink-600 underline w-60">
            姿势卡牌
          </a>
          <a href="/positions" class="block px-4 my-4 border rounded bg-pink-600 underline w-60">
            姿势大全
          </a>
        </div>
        <form method="POST" action="/verify" class="my-8 flex flex-col items-center">
          <div class="font-black my-4">访客验证</div>
          <div class="cf-turnstile" data-sitekey="0x4AAAAAAE94JmZM0XJ7hwkd" />
          <button type="submit" class="px-4 my-4 border rounded bg-pink-600 text-red-100 w-60">
            提交验证
          </button>
        </form>
        <div class="my-8">支持android，ios，平板，电脑等设备访问</div>
      </div>
      <Footer></Footer>
    </div>
  );
}
