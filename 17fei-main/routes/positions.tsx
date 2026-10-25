import { Head } from "$fresh/runtime.ts";

import PositionList from "../islands/position-list.tsx";
import { positions } from "../lib/positions.ts";

const SITE_URL = "https://couples-game.website";

export default function Positions() {
  const canonical = SITE_URL + "/positions";
  const title = "情侣姿势大全 - 100 个双人互动姿势图鉴（免费查看）";
  const description =
    "情侣姿势大全完整图鉴，收录 100 个双人互动姿势参考卡片并配示意图，可按名称检索查看，全部免费开放、无需注册。";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "情侣姿势大全",
    description,
    numberOfItems: positions.length,
    itemListElement: positions.slice(0, 100).map((p: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      name: (p && (p.name || p.title)) || "姿势 " + (i + 1),
    })),
  };
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={SITE_URL + "/kiss-banana.png"} />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <div class="min-h-screen bg-gradient-to-b from-pink-50 to-white px-3 py-6">
        <div class="mx-auto w-full max-w-5xl">
          <h1 class="text-center text-2xl font-bold text-pink-700 mb-4">
            情侣姿势大全 - 100 个双人互动姿势图鉴
          </h1>
          <PositionList positions={positions} />
        </div>
      </div>
    </>
  );
}
