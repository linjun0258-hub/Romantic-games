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
            本站为情侣设计的线上互动游戏「情侣飞行棋」，包含免费的基础内容与可选的 Premium 付费会员服务：免费用户注册登录后，可每日分别体验「基础版」与「恋爱版」飞行棋各 1 次，任务卡牌与姿势卡牌每日亦有免费次数；游客可先行试玩有限的次数。Premium 会员在订阅有效期内不限次数畅玩全部游戏版本，并解锁全部主题棋盘、事件卡与姿势大全完整图鉴等会员内容。
          </p>

          <h2 class="text-xl font-bold mt-8">二、账号</h2>
          <p class="mt-2">
            使用部分功能需要注册账号。你需要提供有效的邮箱地址并妥善保管账号凭据；请勿将账号出售、转让给他人或用于任何违法用途。因保管不善造成的损失由你自行承担。
          </p>

          <h2 class="text-xl font-bold mt-8">三、付费订阅</h2>
          <p class="mt-2">
            Premium 会员为订阅制，价格 $4.99/月，按月自动续订，可随时取消；取消后权益将持续到当前订阅周期结束。付款由第三方支付服务商（Dodo Payments 或 Creem）作为商户记录方（Merchant of Record）处理，本站不存储你的银行卡信息；会员权益在支付成功并由支付服务商回调确认后自动开通。
          </p>

          <h2 class="text-xl font-bold mt-8">四、退款</h2>
          <p class="mt-2">
            如对订阅有疑问或需要退款，请通过邮件联系我们。支付服务商支持合理情形下的退款申请，我们会在核实后协助处理。
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
