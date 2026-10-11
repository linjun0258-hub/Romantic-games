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
          <div class="text-lg text-gray-500">关于本站</div>
          <div class="my-4">
            情侣情趣飞行棋是专为情侣设计的线上互动游戏：掷骰子、抽卡牌、完成甜蜜任务，把两个人的约会变成一场冒险。无需下载，打开网页即可与伴侣一起玩，支持手机、平板与电脑。
          </div>
          <div class="my-4">
            基础内容免费畅玩；Premium 会员 $4.99/月（可随时取消），解锁全部主题棋盘、事件卡、专属情侣任务与纪念日提醒。定价详情见
            <a href="/premium" class="underline"> 会员定价页 </a>。
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
