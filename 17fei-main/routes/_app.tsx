import { AppProps } from "$fresh/server.ts";

const SITE_URL = "https://couples-game.website";
const SITE_NAME = "情侣飞行棋";
const OG_IMAGE = SITE_URL + "/kiss-banana.png";
const OG_LOGO = SITE_URL + "/logo.png";
// 默认分享图（游戏图，横向大图卡片效果更好）
const DEFAULT_IMG = { w: 466, h: 536 };
const LOGO_IMG = { w: 216, h: 216 };

interface SeoConfig {
  title: string;
  description: string;
  noindex?: boolean;
  /** 页面级社交分享图；不填则用默认图 */
  image?: string;
  /** 分享图像素尺寸，便于平台预渲染大图卡片 */
  imageW?: number;
  imageH?: number;
}

// 每个路由独立 title / description：避免全站共用同一标题被判定内容重复
const SEO_MAP: Record<string, SeoConfig> = {
  "/": {
    title: "情侣飞行棋 - 情侣互动小游戏｜全部免费在线玩",
    description:
      "情侣飞行棋是情侣互动的在线小游戏：掷骰子走棋盘、完成甜蜜任务与真心话挑战。提供基础版、恋爱版、情侣版、私密版等主题棋盘，任务卡牌与 100 个浪漫姿势随机抽取，全部免费、无需下载、打开网页即可双人同玩。",
  },
  "/fxq": {
    title: "情侣飞行棋在线玩 - 双人互动棋盘游戏（全部免费）",
    description:
      "在线情侣飞行棋，支持基础版、恋爱版、情侣版、高级版、私密版与自定义模式。掷骰子前进、触发甜蜜事件卡，适合情侣在家互动、异地视频同玩，全部版本免费开放。",
  },
  "/card": {
    title: "情侣任务卡牌 - 10 个主题版本随机抽取（免费）",
    description:
      "情侣任务卡牌小游戏，包含浪漫、日常、亲密等多个主题版本的随机任务卡。点开即抽，适合情侣互动、约会增温、异地聊天破冰，全部免费不限次数。",
  },
  "/card_version": {
    title: "情侣任务卡牌版本列表 - 选择你的主题（免费）",
    description:
      "情侣任务卡牌的全部 10 个主题版本都在这里：从基础版、恋爱版到热恋版、同居版、进阶版，按你们的关系阶段和场合挑选合适的牌组，点开即可开始抽取随机任务卡，所有版本全部免费、不限次数。",
  },
  "/position": {
    title: "情侣姿势卡牌 - 100 个浪漫姿势随机抽（免费）",
    description:
      "情侣姿势卡牌小游戏，内置 100 个浪漫互动姿势，点击卡牌随机抽取，适合情侣在家互动增温。全部免费、不限次数、无需下载。",
  },
  "/positions": {
    title: "情侣姿势大全 - 100 个姿势图鉴完整版（免费查看）",
    description:
      "情侣姿势大全完整图鉴，收录 100 个浪漫互动姿势，按名称与编号逐个检索浏览，每个条目附示意图位与难度标签。支持搜索筛选，全部免费开放、无需注册、手机与电脑均可查看。",
    image: OG_LOGO,
    imageW: LOGO_IMG.w,
    imageH: LOGO_IMG.h,
  },
  "/premium": {
    title: "全部功能免费 - 情侣飞行棋无需会员即可畅玩",
    description:
      "情侣飞行棋全部功能已永久免费：飞行棋多个模式、任务卡牌 10 个主题版本、姿势卡牌与 100 个姿势完整图鉴全部解锁，无需购买会员或订阅，也没有隐藏收费，打开网页即可畅玩，手机与电脑均可使用。",
  },
  "/about": {
    title: "关于我们 - 情侣飞行棋",
    description:
      "了解情侣飞行棋的产品定位、玩法设计与隐私保护原则：一款为情侣打造的在线互动小游戏，包含飞行棋、任务卡牌与姿势卡牌三类玩法，现全部功能免费开放，无需会员与订阅。",
    image: OG_LOGO,
    imageW: LOGO_IMG.w,
    imageH: LOGO_IMG.h,
  },
  "/privacy": {
    title: "隐私政策 - 情侣飞行棋",
    description:
      "情侣飞行棋隐私政策：详细说明我们收集哪些账号信息与游戏数据、如何使用与保护这些信息、Cookie 与本地存储的用途、第三方服务范围，以及你享有的数据导出与删除权利。",
    image: OG_LOGO,
    imageW: LOGO_IMG.w,
    imageH: LOGO_IMG.h,
  },
  "/terms": {
    title: "服务条款 - 情侣飞行棋",
    description:
      "情侣飞行棋服务条款：说明使用本站游戏服务时的账号规则、用户内容规范、免费使用说明、免责声明与条款变更方式，帮助你在使用前了解双方的权利与义务。",
    image: OG_LOGO,
    imageW: LOGO_IMG.w,
    imageH: LOGO_IMG.h,
  },
  "/login": {
    title: "登录 - 情侣飞行棋",
    description: "登录情侣飞行棋账号，继续你们的双人互动游戏。",
    noindex: true,
  },
  "/register": {
    title: "免费注册 - 情侣飞行棋",
    description: "免费注册情侣飞行棋账号，创建属于你们的双人游戏空间。",
    noindex: true,
  },
  "/hall": {
    title: "游戏大厅 - 情侣飞行棋",
    description: "选择想玩的游戏，全部免费开放。",
    noindex: true,
  },
};

const DEFAULT_SEO: SeoConfig = SEO_MAP["/"];

function buildJsonLd(canonical: string, seo: SeoConfig) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": SITE_URL + "/#website",
        url: SITE_URL + "/",
        name: SITE_NAME,
        alternateName: "情侣互动小游戏",
        description: DEFAULT_SEO.description,
        inLanguage: "zh-CN",
        publisher: { "@id": SITE_URL + "/#organization" },
      },
      {
        "@type": "Organization",
        "@id": SITE_URL + "/#organization",
        name: SITE_NAME,
        url: SITE_URL + "/",
        logo: {
          "@type": "ImageObject",
          url: SITE_URL + "/logo.png",
        },
      },
      {
        "@type": "WebPage",
        "@id": canonical + "#webpage",
        url: canonical,
        name: seo.title,
        description: seo.description,
        isPartOf: { "@id": SITE_URL + "/#website" },
        inLanguage: "zh-CN",
      },
    ],
  };
}

export default function App({ Component, url, route }: AppProps) {
  const pathname = (url && url.pathname) || "/";
  const routeKey = (route as string) || pathname;
  const seo = SEO_MAP[routeKey] || SEO_MAP[pathname] || DEFAULT_SEO;
  const canonical = SITE_URL + (pathname === "/" ? "/" : pathname);
  const ogImage = seo.image || OG_IMAGE;
  const ogImageW = seo.imageW || DEFAULT_IMG.w;
  const ogImageH = seo.imageH || DEFAULT_IMG.h;
  const robots = seo.noindex
    ? "noindex,nofollow"
    : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="robots" content={robots} />
        <meta name="author" content={SITE_NAME} />
        <link rel="canonical" href={canonical} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="zh_CN" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content={String(ogImageW)} />
        <meta property="og:image:height" content={String(ogImageH)} />
        <meta property="og:image:alt" content={seo.title} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={seo.title} />
        <meta name="twitter:site" content={SITE_NAME} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJsonLd(canonical, seo)),
          }}
        />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
