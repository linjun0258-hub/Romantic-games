import { AppProps } from "$fresh/server.ts";

const SITE_URL = "https://couples-game.website";
const SITE_NAME = "情侣飞行棋";
const OG_IMAGE = SITE_URL + "/kiss-banana.png";

interface SeoConfig {
  title: string;
  description: string;
  noindex?: boolean;
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
      "查看情侣任务卡牌的全部主题版本，选择喜欢的风格开始抽取随机任务卡，所有版本免费开放。",
  },
  "/position": {
    title: "情侣姿势卡牌 - 100 个浪漫姿势随机抽（免费）",
    description:
      "情侣姿势卡牌小游戏，内置 100 个浪漫互动姿势，点击卡牌随机抽取，适合情侣在家互动增温。全部免费、不限次数、无需下载。",
  },
  "/positions": {
    title: "情侣姿势大全 - 100 个姿势图鉴完整版（免费查看）",
    description:
      "情侣姿势大全完整图鉴，收录 100 个浪漫互动姿势并配示意图，可逐个查看学习，全部免费开放，无需注册。",
  },
  "/premium": {
    title: "全部功能免费 - 情侣飞行棋会员说明",
    description:
      "情侣飞行棋现已全部免费：所有游戏、所有版本、所有主题解锁，无需购买任何会员或订阅，打开网页即可畅玩。",
  },
  "/about": {
    title: "关于我们 - 情侣飞行棋",
    description:
      "了解情侣飞行棋的产品定位、玩法设计与隐私保护原则：一款为情侣打造的在线互动小游戏，全部功能免费开放。",
  },
  "/privacy": {
    title: "隐私政策 - 情侣飞行棋",
    description:
      "情侣飞行棋隐私政策：说明我们如何收集、使用与保护你的账号信息与使用数据。",
  },
  "/terms": {
    title: "服务条款 - 情侣飞行棋",
    description: "情侣飞行棋服务条款，说明使用本站游戏服务时的权利、义务与免责声明。",
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
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:alt" content="情侣飞行棋 - 情侣互动小游戏" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={OG_IMAGE} />

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
