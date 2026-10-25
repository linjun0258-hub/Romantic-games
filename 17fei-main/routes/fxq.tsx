// /fxq 路由：飞行棋大厅与门控
// [deploy] 触发 Vercel 重新部署标记
// 三类身份统一渲染大厅（不再拦截游客 IP），身份与免费额度通过注入脚本控制：
//   游客        ：可浏览全部版本大厅，进入任何版本 → 遮罩引导注册/登录（不能直接玩）
//   注册登录非会员：每天分别可体验 1 次基础版(basic) + 1 次恋爱版(love)，
//                  其余版本（情侣/高级/私密/组合/自定义）进入 → 遮罩引导升级会员
//   会员        ：lockVip=false，全部版本解锁
// 棋盘页（hash mode=1..7）兜底：开局时前端 POST /api/fxq/trial 原子计数校验。
// 因 uni-app SPA 用 pushState 做路由（不触发 hashchange），门控脚本采用
// 事件 + 轮询双保险：包装 pushState/replaceState、监听 popstate/hashchange，
// 并以 800ms 轮询 currentModeId；in-flight 标记防重复调接口；
// 同一会话内已放行的模式用 sessionStorage 标记，刷新不重复计数。
import { Handlers } from "$fresh/server.ts";
import { getUsernameFromRequest } from "../lib/userAuth.ts";
import { isMember } from "../lib/gameAccess.ts";
import { FXQ_HTML } from "../lib/fxq_html.ts";

// 注入到页面的身份与门控脚本（__ROLE__ 由服务端替换为 guest / free / member）
const GATE_SCRIPT = `<script>(function(){
var ROLE="__ROLE__";
var MODE_MAP={basic:1,love:2,couple:3,adult:4,private:5,combo:6,custom:7};
var MODE_NAME={basic:"基础版",love:"恋爱版",couple:"情侣版",adult:"高级版",private:"私密版",combo:"组合模式",custom:"自定义"};

function qs(k){try{var h=location.hash||"";var i=h.indexOf("?");if(i<0)return"";var q=h.slice(i+1);var ps=q.split("&");for(var j=0;j<ps.length;j++){var kv=ps[j].split("=");if(kv[0]===k)return decodeURIComponent(kv[1]||"");}}catch(e){}return"";}
function currentModeId(){var n=parseInt(qs("mode"),10);return isNaN(n)?0:n;}
function modeKeyById(id){for(var k in MODE_MAP){if(MODE_MAP[k]===id)return k;}return"";}
function sessionOk(k){try{return sessionStorage.getItem("fxq_ok_"+k)==="1";}catch(e){return false;}}
function markSessionOk(k){try{sessionStorage.setItem("fxq_ok_"+k,"1");}catch(e){}}

function removeOverlay(){var o=document.getElementById("fxq-gate");if(o&&o.parentNode)o.parentNode.removeChild(o);}
function overlay(title,desc,btns){
  removeOverlay();
  var o=document.createElement("div");o.id="fxq-gate";
  o.setAttribute("style","position:fixed;inset:0;z-index:2147483647;background:rgba(17,24,39,.55);display:flex;align-items:center;justify-content:center;padding:24px;");
  var c=document.createElement("div");
  c.setAttribute("style","background:#fff;border-radius:16px;max-width:22rem;width:100%;padding:2rem 1.5rem;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.25);font-family:system-ui,sans-serif;");
  var h="<div style='font-size:2.4rem;line-height:1'>&#x1F3B2;</div>"+
        "<div style='font-size:1.25rem;font-weight:700;color:#be185d;margin:.6rem 0 .4rem'>"+title+"</div>"+
        "<div style='color:#6b7280;font-size:.95rem;margin-bottom:1.2rem'>"+desc+"</div>";
  var b="";
  for(var i=0;i<btns.length;i++){var x=btns[i];
    var st=x.primary?("background:#ec4899;color:#fff;"):("border:1px solid #f9a8d4;color:#db2777;background:#fff;");
    b+="<a href='"+x.href+"' style='display:block;margin:.5rem 0;padding:.75rem 1rem;border-radius:9999px;font-weight:600;text-decoration:none;"+st+"'>"+x.text+"</a>";
  }
  c.innerHTML=h+b;
  o.appendChild(c);
  (document.body||document.documentElement).appendChild(o);
}
function backBtn(){return {href:"#/",text:"返回大厅",primary:0};}

// 站内品牌标题锁：游戏 bundle 运行后会把 document.title 改回模板残留名称（晓倩笔记）
var BRAND_TITLE="情侣飞行棋 - 情侣互动小游戏";
function lockTitle(){try{if(document.title!==BRAND_TITLE)document.title=BRAND_TITLE;}catch(e){}}

// 常驻返回导航：左上角「游戏大厅」始终可见，「版本列表」仅在棋盘页(mode!=0)出现
function ensureNav(){
  var n=document.getElementById("fxq-nav");
  if(!n){
    n=document.createElement("div");n.id="fxq-nav";
    n.setAttribute("style","position:fixed;top:10px;left:10px;z-index:2147483647;display:flex;gap:8px;align-items:center;font-family:system-ui,-apple-system,sans-serif;");
    var s="display:inline-flex;align-items:center;gap:4px;padding:8px 14px;border-radius:9999px;font-size:14px;font-weight:600;text-decoration:none;background:rgba(17,24,39,.85);color:#fff;border:1px solid rgba(255,255,255,.28);box-shadow:0 4px 14px rgba(0,0,0,.35);white-space:nowrap;";
    n.innerHTML="<a id='fxq-nav-hall' href='/hall' style='"+s+"'>&#x1F3E0; 返回游戏大厅</a>"+
                "<a id='fxq-nav-modes' href='#/' style='"+s+"'>&#x2190; 版本列表</a>";
    (document.body||document.documentElement).appendChild(n);
  }
  var m=document.getElementById("fxq-nav-modes");
  if(m){m.style.display=currentModeId()?"":"none";}
  // 门控遮罩 z-index 同为最大值且后创建，需把导航重新追加到 body 末尾，确保始终位于遮罩之上可点击
  if(n && n.parentNode && n.parentNode.lastChild!==n){(document.body||document.documentElement).appendChild(n);}
}
function gateLogin(){overlay("请先登录","注册 / 登录后，每天可体验基础版和恋爱版各 1 次",[{href:"/login",text:"登录 / 注册",primary:1},{href:"/premium",text:"了解会员",primary:0},backBtn()]);}
function gateVip(name){overlay("会员专属版本",name+" 为会员专属，升级后解锁全部版本",[{href:"/premium",text:"升级会员解锁",primary:1},backBtn()]);}
function gateUsed(name){overlay("今日体验已用完",name+" 每天可体验 1 次，明天再来，或升级会员不限次数",[{href:"/premium",text:"升级会员不限次",primary:1},backBtn()]);}

function checkStart(modeKey){
  return fetch("/api/fxq/trial",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:modeKey})})
    .then(function(r){return r.json().catch(function(){return{ok:false};});})
    .catch(function(){return{ok:false};});
}

var inflight=false;
var lastId=0;

// 核心校验：进入棋盘页(mode) 时按身份放行或弹遮罩
function guardBoard(){
  try{ensureNav();lockTitle();}catch(e){}
  var id=currentModeId();
  if(!id){ if(lastId!==0){lastId=0;removeOverlay();} return; }
  if(id!==lastId){ lastId=id; inflight=false; } // 切换模式时重置
  if(ROLE==="member"){ removeOverlay(); return; }
  if(ROLE==="guest"){ gateLogin(); return; }
  // free
  var key=modeKeyById(id);if(!key)return;
  if(sessionOk(key))return;               // 本会话已放行
  if(document.getElementById("fxq-gate"))return; // 已有遮罩
  if(inflight)return;                     // 防止轮询重复调接口
  inflight=true;
  checkStart(key).then(function(res){
    inflight=false;
    if(currentModeId()!==id)return;        // 已离开棋盘页
    if(res&&res.ok){markSessionOk(key);removeOverlay();return;}
    if(res&&res.reason==="used")gateUsed(MODE_NAME[key]||"该版本");
    else if(res&&res.reason==="login")gateLogin();
    else gateVip(MODE_NAME[key]||"该版本");
  }).catch(function(){inflight=false;});
}

// 事件 + 轮询双保险：uni-app 用 pushState 路由不触发 hashchange
try{
  var _ps=history.pushState, _rs=history.replaceState;
  function hook(fn){return function(){var r=fn.apply(this,arguments);try{setTimeout(guardBoard,0);}catch(e){}return r;};}
  history.pushState=hook(_ps);
  history.replaceState=hook(_rs);
}catch(e){}
window.addEventListener("popstate",function(){setTimeout(guardBoard,0);});
window.addEventListener("hashchange",function(){setTimeout(guardBoard,0);});
setInterval(guardBoard,800);
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",guardBoard);}else{guardBoard();}
})();</script>`;

export const handler: Handlers = {
  async GET(req) {
    const username = getUsernameFromRequest(req);
    if (username) {
      const member = await isMember(username);
      // member: 全部解锁；free: lockVip=true 锁定高级版本展示，基础/恋爱由 /api/fxq/trial 按天计数
      return render(FXQ_HTML, !member, member ? "member" : "free");
    }
    // 游客：可浏览全部版本大厅，进入即遮罩引导登录；lockVip=true 保持高级版本锁定展示
    return render(FXQ_HTML, true, "guest");
  },
};

const FXQ_JSONLD = '<script type="application/ld+json">' + JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://couples-game.website/fxq#webpage",
  "url": "https://couples-game.website/fxq",
  "name": "\u60c5\u4fa3\u98de\u884c\u68cb - \u60c5\u4fa3\u4e92\u52a8\u5c0f\u6e38\u620f",
  "description": "\u514d\u8d39\u5728\u7ebf\u60c5\u4fa3\u98de\u884c\u68cb\uff0c\u652f\u6301\u57fa\u7840\u7248\u3001\u604b\u7231\u7248\u4e0e\u9ad8\u7ea7\u7248\u591a\u79cd\u6a21\u5f0f\uff0c\u53cc\u4eba\u540c\u5c4f\u5373\u53ef\u5f00\u73a9\uff0c\u5168\u90e8\u529f\u80fd\u514d\u8d39\u3002",
  "inLanguage": "zh-CN",
  "isPartOf": { "@type": "WebSite", "@id": "https://couples-game.website/#website", "name": "\u60c5\u4fa3\u98de\u884c\u68cb", "url": "https://couples-game.website/" },
  "about": { "@type": "VideoGame", "name": "\u60c5\u4fa3\u98de\u884c\u68cb", "applicationCategory": "Game", "operatingSystem": "Web", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" } },
  "breadcrumb": { "@type": "BreadcrumbList", "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "\u9996\u9875", "item": "https://couples-game.website/" },
    { "@type": "ListItem", "position": 2, "name": "\u60c5\u4fa3\u98de\u884c\u68cb", "item": "https://couples-game.website/fxq" }
  ] }
}) + '</script>';

function render(template: string, locked: boolean, role: string): Response {
  const gateScript = GATE_SCRIPT.replace(/__ROLE__/g, role);
  const body = template
    // 按身份改写 lockVip 开关（游戏加载前读取）
    .replace("__LOCKVIP__", locked ? "true" : "false")
    // 文档基准修正：页面挂在 /fxq，bundle 懒加载 chunk 需相对 /fxq/static/
    .replace("<head>", '<head><base href="/fxq/">' + '<link rel="canonical" href="https://couples-game.website/fxq">' + '<meta name="description" content="\u60c5\u4fa3\u98de\u884c\u68cb\u5728\u7ebf\u73a9\uff1a\u652f\u6301\u53cc\u4eba\u540c\u5c4f\u7684\u60c5\u4fa3\u4e92\u52a8\u5c0f\u6e38\u620f\uff0c\u5305\u542b\u4ee5\u4e0b\u7248\u672c\uff1a\u57fa\u7840\u7248\u3001\u604b\u7231\u7248\u3001\u60c5\u4fa3\u7248\u3001\u9ad8\u7ea7\u7248\uff0c\u5168\u90e8\u514d\u8d39\u3002">' + '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">' + '<meta property="og:type" content="website">' + '<meta property="og:site_name" content="\u60c5\u4fa3\u98de\u884c\u68cb">' + '<meta property="og:url" content="https://couples-game.website/fxq">' + '<meta property="og:title" content="\u60c5\u4fa3\u98de\u884c\u68cb\u5728\u7ebf\u73a9 - \u53cc\u4eba\u4e92\u52a8\uff0c\u5168\u90e8\u514d\u8d39">' + '<meta property="og:description" content="\u514d\u8d39\u5728\u7ebf\u60c5\u4fa3\u98de\u884c\u68cb\uff0c\u652f\u6301\u591a\u79cd\u6a21\u5f0f\uff0c\u53cc\u4eba\u540c\u5c4f\u5373\u53ef\u5f00\u73a9\u3002">' + '<meta property="og:image" content="https://couples-game.website/logo.png">' + '<meta name="twitter:card" content="summary_large_image">' + '<meta name="twitter:title" content="\u60c5\u4fa3\u98de\u884c\u68cb\u5728\u7ebf\u73a9 - \u53cc\u4eba\u4e92\u52a8\uff0c\u5168\u90e8\u514d\u8d39">' + '<meta name="twitter:description" content="\u514d\u8d39\u5728\u7ebf\u60c5\u4fa3\u98de\u884c\u68cb\uff0c\u591a\u79cd\u6a21\u5f0f\u53cc\u4eba\u540c\u5c4f\u5f00\u73a9\u3002">' + FXQ_JSONLD)
    // 静态资源相对路径 ./static/ → /fxq/static/
    .replace(/=(["']?)\.\/static\//g, "=$1/fxq/static/")
    // 去掉模板自带的 noindex 标签（会覆盖上面的 index,follow 导致整页不被收录）
    .replace(/<meta\s+name=robots\s+content="[^"]*"\s*\/?>/i, "")
    // 身份门控脚本注入到 #app 之后（body 已存在，遮罩可立即挂载）
    .replace("<div id=app></div>", "<div id=app></div>" + gateScript);
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
