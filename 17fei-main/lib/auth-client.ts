// 轻量认证客户端助手（纯浏览器端，零 npm 依赖）
// 背景：Vercel Deno 运行时无法加载 better-auth npm 包（缓存限制），
// 故认证统一走自建方案：userAuth 会话 Cookie + 自建 Google OAuth
// 服务端配套路由：/login/google（授权入口）、/api/auth/callback/google（回调）、
// /api/auth/get-session（会话查询）、/api/auth/signout（退出登录）

export interface SessionInfo {
  loggedIn: boolean;
  username?: string;
  source?: string;
}

// 跳转 Google 登录（redirectTo 为登录成功后要回到的页面路径）
export function signInWithGoogle(redirectTo = "/"): void {
  window.location.href =
    `/login/google?redirect=${encodeURIComponent(redirectTo)}`;
}

// 查询当前登录状态
export async function getCurrentUser(): Promise<SessionInfo> {
  try {
    const res = await fetch("/api/auth/get-session", {
      headers: { accept: "application/json" },
    });
    if (!res.ok) return { loggedIn: false };
    const data = await res.json();
    if (data && data.user) {
      return {
        loggedIn: true,
        username: data.user.name ?? data.user.username,
        source: data.user.source,
      };
    }
    return { loggedIn: false };
  } catch {
    return { loggedIn: false };
  }
}

// 退出登录（清除会话 Cookie）
export function signOut(redirectTo = "/"): void {
  window.location.href =
    `/api/auth/signout?redirect=${encodeURIComponent(redirectTo)}`;
}
