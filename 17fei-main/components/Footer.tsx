// 站点共享页脚：关于、会员定价、法务页面与支持邮箱入口（公开可访问）
export default function Footer() {
  return (
    <>
      <div class="text-center mt-8 p-2 space-x-2">
        <a class="bg-red-700 border rounded py-2 px-4 font-black" href="/about">
          关于
        </a>
        <a class="bg-pink-600 border rounded py-2 px-4 font-black" href="/join">
          免费会员
        </a>
        <a class="bg-pink-500 border rounded py-2 px-4 font-black" href="/premium">
          会员定价
        </a>
        <a class="bg-red-600 border rounded py-2 px-4 font-black" href="/privacy">
          隐私政策
        </a>
        <a class="bg-red-600 border rounded py-2 px-4 font-black" href="/terms">
          服务条款
        </a>
      </div>
      <div class="text-center mt-6 text-pink-100 text-sm">
        联系我们：
        <a class="underline" href="mailto:linjun0258@gmail.com">
          linjun0258@gmail.com
        </a>
      </div>
    </>
  );
}
