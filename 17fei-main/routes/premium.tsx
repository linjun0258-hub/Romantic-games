// /premium 页面：现已全部免费，本页不再提供任何付费入口
// 保留该路由只为兼容旧链接，避免 404；页面仅说明「全部功能免费」
import Footer from "../components/Footer.tsx";

export default function PremiumPage() {
  return (
    <div class="min-h-screen bg-gray-100 px-4 py-12">
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
