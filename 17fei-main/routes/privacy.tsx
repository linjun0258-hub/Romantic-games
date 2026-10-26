// 隐私政策：/privacy
// 公开可访问，站内页脚（Footer 组件）与关于页均链接至此
import { Head } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";

const CONTACT_EMAIL = "linjun0258@gmail.com";
const LAST_UPDATED = "2026年10月11日";

export default function Privacy() {
  return (
    <div class="p-2 w-full min-h-screen bg-pink-400 text-lg leading-8 text-red-100">
      <Head>
        <title>隐私政策 - 情侣飞行棋</title>
      </Head>
      <div class="max-w-screen-md mx-auto pb-16">
        <div class="flex w-full items-center p-2">
          <a class="flex-1" href="/">
            <img src="/logo.png" class="h-12 w-12" alt="情侣飞行棋" />
          </a>
        </div>
        <div class="px-2">
          <h1 class="text-3xl font-bold mt-6">隐私政策</h1>
          <p class="mt-2">最后更新：{LAST_UPDATED}</p>
          <p class="mt-4">
            情侣飞行棋（下称「本站」）非常重视你的隐私。本政策说明我们在你使用本站时收集哪些信息、如何使用与保护这些信息，以及你享有的权利。
          </p>

          <h2 class="text-xl font-bold mt-8">一、我们收集的信息</h2>
          <ul class="list-disc pl-6 mt-2">
            <li>账号信息：注册时提供的邮箱地址与用户名，用于创建和识别你的账号。</li>
            <li>游戏数据：房间与对局记录、任务完成状态等，用于双人同步游戏进度。</li>
            <li>支付信息：本站当前不提供任何付费项目，因此不收集、不存储你的银行卡号或其他支付凭据。</li>
            <li>安全验证信息：本站使用 Cloudflare Turnstile 进行人机验证，相关数据由 Cloudflare 按其隐私政策处理。</li>
          </ul>

          <h2 class="text-xl font-bold mt-8">二、信息的使用</h2>
          <p class="mt-2">
            我们仅将上述信息用于：提供和维护游戏服务；管理账号与对局进度；发送与账号相关的必要通知；改进站内体验与排查故障。我们不会出售你的个人信息。
          </p>

          <h2 class="text-xl font-bold mt-8">三、Cookie 与本地存储</h2>
          <p class="mt-2">
            本站使用会话 Cookie 与必要的浏览器本地存储来保持登录状态与游戏进度，不用于广告跟踪。清除浏览器数据后可能需要重新登录。
          </p>

          <h2 class="text-xl font-bold mt-8">四、第三方服务</h2>
          <ul class="list-disc pl-6 mt-2">
            <li>Vercel：本站的托管与内容分发平台，访问日志按其隐私政策处理。</li>
            <li>Cloudflare：Turnstile 人机验证。</li>
          </ul>

          <h2 class="text-xl font-bold mt-8">五、数据保留与删除</h2>
          <p class="mt-2">
            账号与游戏数据在你使用本站期间保留。如需导出或删除你的账号及数据，请发送邮件至 {CONTACT_EMAIL}，我们将在合理期限内处理。
          </p>

          <h2 class="text-xl font-bold mt-8">六、未成年人</h2>
          <p class="mt-2">
            本站包含面向成年情侣的亲密互动内容，仅限 18 周岁及以上用户使用。我们不会故意收集未成年人的个人信息。
          </p>

          <h2 class="text-xl font-bold mt-8">七、数据安全</h2>
          <p class="mt-2">
            本站全程使用 HTTPS 加密传输，并对登录等敏感操作进行签名校验，防止数据被篡改或伪造。
          </p>

          <h2 class="text-xl font-bold mt-8">八、政策更新</h2>
          <p class="mt-2">本政策可能不定期更新，重大变更会在本页面公告。继续使用本站即视为接受更新后的政策。</p>

          <h2 class="text-xl font-bold mt-8">九、联系我们</h2>
          <p class="mt-2">
            如有任何问题，请联系：
            <a class="underline" href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>
          </p>
        </div>

        <Footer />
      </div>
    </div>
  );
}
