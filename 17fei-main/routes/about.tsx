import Footer from "../components/Footer.tsx";

export default function About() {
  return (
    <div class="text-shadow min-h-screen w-full bg-pink-300 p-2 text-lg leading-8 text-red-100">
      <div class="mx-auto flex max-w-screen-md flex-col items-center justify-center">
        <div class="flex w-full items-center p-2">
          <a class="flex-1" href="/">
            <img src="/logo.png" class="h-12 w-12" alt="情侣情趣飞行棋" />
          </a>
        </div>
        <div class="max-auto mt-8 max-w-lg leading-8 text-gray-900">
          <h1 class="text-lg text-gray-500">关于本站</h1>
          <div class="my-4">
            情侣情趣飞行棋是专为情侣设计的线上互动游戏：掷骰子、抽卡牌、完成甜蜜任务，把两个人的约会变成一场冒险。无需下载，打开网页即可与伴侣一起玩，支持手机、平板与电脑。
          </div>
          <div class="my-4">
            站内全部内容目前完全免费开放：情侣飞行棋的 7 种模式、情侣任务卡牌的 10 个主题、情侣姿势卡牌与情侣姿势大全的 100 个姿势，都可以直接玩，不需要购买会员，也没有隐藏收费。
          </div>
          <div class="my-4">
            使用本站即表示同意
            <a href="/terms" class="underline"> 服务条款 </a>
            与
            <a href="/privacy" class="underline"> 隐私政策 </a>。如有任何问题，欢迎邮件联系 linjun0258@gmail.com。
          </div>
          <div class="mt-4">
            如需其他定制开发， 欢迎联系合作。
            <a href="/custom" class="underline"> 如何制作一个相同的网站赚钱 </a>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
