// 姿势卡牌页：原版纯静态抽卡页 + 游戏门槛（游客 3 抽/天，免费用户限前 20 个姿势，会员全开 100 个）
// 门槛逻辑内联在页面里，通过 /api/game-access 判定档位，无需改 positions.js 的抽卡实现
import { Head } from "$fresh/runtime.ts";

const GATE_JS = `
(function () {
  var state = { role: "member", remaining: 999, limit: 3, loaded: false };

  function todayKey() {
    return "position_gate_" + new Date().toISOString().slice(0, 10);
  }
  function localUsed() {
    try { return parseInt(localStorage.getItem(todayKey()) || "0", 10) || 0; } catch (e) { return 0; }
  }
  function localCount(n) {
    try { localStorage.setItem(todayKey(), String(n)); } catch (e) {}
  }

  fetch("/api/game-access?surface=position", { credentials: "same-origin" })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      state.loaded = true;
      state.role = d.role || "guest";
      state.remaining = typeof d.remaining === "number" ? d.remaining : 999;
      state.limit = d.limit || 3;
      if (state.role === "guest") {
        // localStorage 双层计数：显示与放行取后端与本地较小值，防止清缓存绕过
        state.remaining = Math.min(state.remaining, Math.max(0, state.limit - localUsed()));
      }
      if (state.role === "guest" || state.role === "free") {
        // 免费体验池：只抽前 20 个姿势（原抽卡用 Math.floor(100 * Math.random())，
        // 把随机数缩到 [0, 0.2) 即等价于索引落在 [0, 20)）
        Math.random = (function (orig) {
          return function () { return orig() * 0.2; };
        })(Math.random);
        var countEl = document.getElementById("position-count");
        if (countEl) countEl.textContent = "20";
      }
      applyTip();
    })
    .catch(function () {
      // 接口异常：按免费用户放行，不做限制
      state.loaded = true;
      applyTip();
    });

  function applyTip() {
    var el = document.getElementById("gate-tip");
    if (!el) return;
    if (state.role === "member") {
      el.textContent = "会员畅玩全部 100 个姿势";
    } else if (state.role === "free") {
      el.textContent = "免费版可抽前 20 个姿势，升级会员解锁全部 100 个";
    } else if (state.remaining > 0) {
      el.textContent = "游客今日剩余 " + state.remaining + " 次，登录后不限次数";
    } else {
      el.textContent = "游客今日 3 次机会已用完";
    }
  }

  function showPaywall() {
    var overlay = document.createElement("div");
    overlay.id = "gate-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(219,39,119,.94);color:#fff;" +
      "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
      "z-index:99999;text-align:center;padding:24px;";
    overlay.innerHTML =
      '<div style="font-size:2.5rem;margin-bottom:12px">💗</div>' +
      '<div style="font-size:1.25rem;font-weight:700;margin-bottom:8px">今日免费抽取已用完</div>' +
      '<div style="opacity:.9;margin-bottom:20px">登录后不限次数抽卡，升级会员解锁全部姿势</div>' +
      '<div>' +
      '<a href="/login" style="display:inline-block;margin:4px;padding:10px 22px;border-radius:999px;background:#fff;color:#db2777;font-weight:700;text-decoration:none">登录 / 注册</a>' +
      '<a href="/premium" style="display:inline-block;margin:4px;padding:10px 22px;border-radius:999px;background:#be185d;color:#fff;font-weight:700;text-decoration:none">升级会员</a>' +
      '</div>';
    document.body.appendChild(overlay);
    var tip = document.getElementById("gate-tip");
    if (tip) tip.textContent = "今日免费次数已用完，登录或升级会员后继续";
    try {
      // 硬断原抽卡监听（positions.js 通过 jQuery 注册）
      if (window.jQuery) window.jQuery("#card").off("change");
    } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyTip();
    var card = document.getElementById("card");
    if (!card) return;
    card.addEventListener("change", function () {
      // 与原逻辑一致：checked 变为 false = 完成一次翻开抽取
      if (card.checked) return;
      if (state.role !== "guest") return;
      if (state.remaining <= 0) { showPaywall(); return; }
      state.remaining -= 1;
      localCount(localUsed() + 1);
      applyTip();
      fetch("/api/game-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ surface: "position" })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (typeof d.remaining === "number") {
            state.remaining = Math.min(state.remaining, d.remaining);
          }
          if (state.remaining <= 0) showPaywall();
        })
        .catch(function () {});
    });
  });
})();
`;

export default function Card() {
  return (
    <>
      <Head>
        <link href="/card.css" rel="stylesheet"></link>
        <script src="/js/jquery.min.js"></script>
        <script src="/js/howler.min.js"></script>
        <script src="/positions.js"></script>
        <script
          dangerouslySetInnerHTML={{ __html: GATE_JS }}
        />
        <title>情侣姿势卡牌游戏 - 100 个姿势随机抽卡（免费在线玩）</title>
      </Head>
      <div class="w-full leading-8 min-h-screen text-shadow bg-pink-400 text-lg text-red-100">
        <div class="max-w-screen-md mx-auto ">
          <div class="p-2 flex items-center w-full">
            <a class="flex-1" href="/">
              <img src="/logo.png" class="w-12 h-12" />
            </a>
          </div>
          <div class="flex my-2 justify-center">
            <input type="checkbox" id="card" checked />
            <label for="card">
              <div class="cardWrapper ">
                <div class="cardRandom h-full flex flex-col items-center">
                  <div class="flex-1"></div>
                  <div class="relative p-4 flex-auto font-black text-3xl text-pink-600">
                    <p id="position" class="text-center">点击卡牌抽取</p>
                  </div>
                  <div class="flex-1"></div>
                </div>
              </div>
            </label>
          </div>
          <div class="text-center">
            抽一个试试（共<span id="position-count">100</span>个姿势）
            <p id="gate-tip" class="text-base opacity-90 mt-1"></p>
          </div>
        </div>
      </div>
      <section class="max-w-screen-md mx-auto mt-10 mb-8 px-4">
        <div class="bg-white text-gray-800 rounded-2xl p-6 leading-8 text-left shadow">
          <h1 class="text-2xl font-extrabold text-pink-700 mb-4 leading-snug">
            情侣姿势卡牌：100 个姿势随机抽卡，免费在线玩
          </h1>
          <p class="mb-3">
            情侣姿势卡牌把「今天试什么」这件事交给了抽卡。整副牌收录 100 个不同姿势，点一下随机抽一张，抽到哪张就参考哪张，省去两个人翻来覆去商量和临时想不出来的尴尬。每张牌都有名称和编号，方便你们记住喜欢的那些，下次直接找回来。
          </p>
          <p class="mb-5">
            全部 100 个姿势免费开放，不限抽取次数，无需购买会员。请双方自愿、注意舒适与安全，把它当作增进亲密感的辅助小游戏。
          </p>

          <h2 class="text-lg font-bold text-pink-700 mt-6 mb-2">怎么玩？</h2>
          <ol class="list-decimal pl-6 mb-4 space-y-1">
            <li>两个人一起打开这个页面。</li>
            <li>点击卡牌，随机抽出一个姿势。</li>
            <li>看到名称后按自己的节奏尝试，觉得不合适就再抽一张。</li>
            <li>喜欢的可以记下编号，下次直接复用。</li>
          </ol>
          <p class="mb-5">没有输赢也没有回合限制，抽几张完全由你们决定。</p>

          <h2 class="text-lg font-bold text-pink-700 mt-6 mb-2">100 个姿势涵盖哪些类型？</h2>
          <p class="mb-3">
            卡牌按难易程度和使用场景分为不同类别，既有适合刚开始尝试的基础款，也有需要更多默契的进阶款。如果想把 100 个姿势一次看全，可以打开
            <a href="/positions" class="text-pink-600 underline">情侣姿势大全</a>
            图鉴按分类浏览。
          </p>

          <h2 class="text-lg font-bold text-pink-700 mt-6 mb-3">常见问题</h2>
          <h3 class="font-bold mt-4 mb-1">情侣姿势卡牌要付费吗？</h3>
          <p class="mb-3">不需要。100 个姿势全部免费，不限抽取次数，也没有会员门槛。</p>
          <h3 class="font-bold mt-4 mb-1">抽到的姿势不喜欢怎么办？</h3>
          <p class="mb-3">直接再抽一张即可，没有次数限制，也没有惩罚机制。</p>
          <h3 class="font-bold mt-4 mb-1">和姿势大全有什么区别？</h3>
          <p class="mb-3">
            姿势卡牌是随机抽取、一张一张玩；<a href="/positions" class="text-pink-600 underline">姿势大全</a>是完整图鉴，可以按分类慢慢看、自己挑。
          </p>
          <h3 class="font-bold mt-4 mb-1">需要下载 App 吗？</h3>
          <p class="mb-5">不需要，浏览器打开就能用，手机和电脑都支持。</p>

          <h2 class="text-lg font-bold text-pink-700 mt-6 mb-2">其他免费玩法</h2>
          <ul class="list-disc pl-6">
            <li class="mb-1"><a href="/fxq" class="text-pink-600 underline">情侣飞行棋</a>：7 种模式的棋盘互动游戏。</li>
            <li class="mb-1"><a href="/card" class="text-pink-600 underline">情侣任务卡牌</a>：抽卡完成浪漫任务。</li>
            <li class="mb-1"><a href="/positions" class="text-pink-600 underline">情侣姿势大全</a>：完整图鉴免费查看。</li>
            <li><a href="/" class="text-pink-600 underline">返回首页</a>，查看全部游戏。</li>
          </ul>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "情侣姿势卡牌要付费吗？",
                "acceptedAnswer": { "@type": "Answer", "text": "不需要。100 个姿势全部免费，不限抽取次数，也没有会员门槛。" },
              },
              {
                "@type": "Question",
                "name": "抽到的姿势不喜欢怎么办？",
                "acceptedAnswer": { "@type": "Answer", "text": "直接再抽一张即可，没有次数限制，也没有惩罚机制。" },
              },
              {
                "@type": "Question",
                "name": "和姿势大全有什么区别？",
                "acceptedAnswer": { "@type": "Answer", "text": "姿势卡牌是随机抽取、一张一张玩；姿势大全是完整图鉴，可以按分类慢慢看、自己挑。" },
              },
              {
                "@type": "Question",
                "name": "需要下载 App 吗？",
                "acceptedAnswer": { "@type": "Answer", "text": "不需要，浏览器打开就能用，手机和电脑都支持。" },
              },
            ],
          }),
        }}
      />
    </>
  );
}
