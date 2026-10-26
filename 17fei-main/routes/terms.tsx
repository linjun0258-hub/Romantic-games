// 服务条款：/terms
// 公开可访问，站内页脚（Footer 组件）与关于页均链接至此
import { Head } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";

const CONTACT_EMAIL = "linjun0258@gmail.com";
const LAST_UPDATED = "2026年10月11日";

export default function Terms() {
  return (
    <div class="p-2 w-full min-h-screen bg-pink-400 text-lg leading-8 text-red-100">
      <Head>
        <title>服务条款 - 情侣飞行棋</title>
      </Head>
      <div class="max-w-screen-md mx-auto pb-16">
        <div class="flex w-full items-center p-2">
          <a class="flex-1" href="/">
            <img src="/logo.png" class="h-12 w-12" alt="情侣飞行棋" />
          </a>
        </div>
        <div class="px-2">
          <h1 class="text-3xl font-bold mt-6">服务条款</h1>
          <p class="mt-2">最后更新：{LAST_UPDATED}</p>
          <p class="mt-4">
            使用情侣飞行棋（下称「本站」）即表示你已阅读并同意本条款。请仔细阅读后再开始使用。
          </p>

          <h2 class="text-xl font-bold mt-8">一、服务说明</h2>
          <p class="mt-2">
            本站为情侣设计的线上互动游戏「情侣飞行棋」，目前全部内容免费开放：情侣飞行棋的全部 7 种模式、情侣任务卡牌的全部 10 个主题、情侣姿势卡牌与情侣姿势大全的全部 100 个姿势，注册登录后均可免费游玩，不限次数，不存在需要付费解锁的内容。游客可先行试玩有限的次数。
          </p>

          <h2 class="text-xl font-bold mt-8">二、账号</h2>
          <p class="mt-2">
            使用部分功能需要注册账号。你需要提供有效的邮箱地址并妥善保管账号凭据；请勿将账号出售、转让给他人或用于任何违法用途。因保管不善造成的损失由你自行承担。
          </p>

          <h2 class="text-xl font-bold mt-8">三、免费使用</h2>
          <p class="mt-2">
            本站当前不提供任何付费订阅或内购项目，全部游戏内容免费开放。由于站内不收取任何费用，我们不会向你索取支付信息，也不会产生扣费或自动续订。若未来调整收费策略，我们会提前在本页显著位置公示。
          </p>

          <h2 class="text-xl font-bold mt-8">四、费用与联系</h2>
          <p class="mt-2">
            本站目前全部功能免费，不存在待退款订单。如对账号、内容或条款有任何疑问，欢迎通过本页底部的联系邮箱与我们沟通，我们会尽快回复。
          </p>

          <h2 class="text-xl font-bold mt-8">五、使用规范</h2>
          <p class="mt-2">
            本站包含面向成年情侣的亲密互动内容，仅限 18 周岁及以上用户使用。使用本站时请遵守适用法律法规，不得上传或传播违法、侵权或骚扰性内容，不得干扰本站正常运行或试图非法获取他人数据。
          </p>

          <h2 class="text-xl font-bold mt-8">六、知识产权</h2>
          <p class="mt-2">本站的界面、文案、游戏设计与相关素材的知识产权归本站运营者所有。未经许可，不得复制、爬取、分发或用于商业用途。</p>

          <h2 class="text-xl font-bold mt-8">七、免责声明</h2>
          <p class="mt-2">本站按「现状」提供。在适用法律允许的最大范围内，我们不对服务中断、数据丢失或因使用本站产生的间接损失承担责任。游戏内容仅供娱乐。</p>

          <h2 class="text-xl font-bold mt-8">八、条款变更</h2>
          <p class="mt-2">我们可能不定期更新本条款，重大变更会在本页面公告。更新后继续使用本站即视为接受新条款。</p>

          <h2 class="text-xl font-bold mt-8">九、联系我们</h2>
          <p class="mt-2">
            如对本条款有任何问题，请联系：
            <a class="underline" href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>
          </p>
        </div>

        <Footer />
      </div>
    </div>
  );
}
