// 404 页：/（任意未匹配路径）
// 原为 Fresh 脚手架模板：英文 + 绿色底 + Fresh logo，与本站风格完全割裂，
// 且默认模板指向 /logo.svg（本站为 logo.png，缺失），已重写为站内中文样式。
import { Head } from "$fresh/runtime.ts";

export default function Error404() {
  return (
    <div class="p-2 w-full min-h-screen bg-pink-400 text-lg leading-8 text-red-100">
      <Head>
        <title>页面不存在 - 情侣飞行棋</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div class="max-w-screen-md mx-auto pb-16">
        <div class="flex w-full items-center p-2">
          <a class="flex-1" href="/">
            <img src="/logo.png" class="h-12 w-12" alt="情侣飞行棋" />
          </a>
        </div>

        <div class="px-2 mt-16 text-center">
          <h1 class="text-5xl font-bold">404</h1>
          <p class="mt-6">这个页面走丢了，可能已经移到别处或输入有误。</p>

          <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              class="rounded-lg bg-red-100 px-6 py-3 font-bold text-pink-400"
            >
              返回首页
            </a>
            <a
              href="/fxq"
              class="rounded-lg border border-red-100 px-6 py-3 font-bold"
            >
              去玩飞行棋
            </a>
          </div>

          <p class="mt-12 text-sm">
            如果确认链接无误仍无法访问，请联系{" "}
            <a href="mailto:linjun0258@gmail.com" class="underline">
              linjun0258@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
