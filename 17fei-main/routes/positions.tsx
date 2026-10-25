import { Head } from "$fresh/runtime.ts";

import PositionList from "../islands/position-list.tsx";
import { positions } from "../lib/positions.ts";

export default function Positions() {
  return (
    <>
      <Head>
        <title>情侣姿势卡牌游戏</title>
        <meta
          name="description"
          content="情侣姿势大全：按名称检索的双人互动姿势参考卡片，支持自定义插图。"
        />
      </Head>
      <div class="min-h-screen bg-gradient-to-b from-pink-50 to-white px-3 py-6">
        <div class="mx-auto w-full max-w-5xl">
          <PositionList positions={positions} />
        </div>
      </div>
    </>
  );
}
