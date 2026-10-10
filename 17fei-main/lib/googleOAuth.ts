// 自建 Google OAuth 助手（仅用 Web API：fetch + crypto.subtle，零 npm 依赖）
// 背景：Vercel Deno 运行时对新增 npm 包有缓存限制，故 OAuth 全流程用原生 API 实现
// 凭据从 Vercel 环境变量读取：GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
// 回调地址：https://<域名>/api/auth/callback/google

export const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

export function googleConfigured(): boolean {
  return Boolean(
    Deno.env.get("GOOGLE_CLIENT_ID") && Deno.env.get("GOOGLE_CLIENT_SECRET"),
  );
}

export function callbackUrl(origin: string): string {
  return `${origin}/api/auth/callback/google`;
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmac(message: string): Promise<string> {
  const secret = Deno.env.get("SESSION_SECRET") ?? "dev-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return b64urlEncode(new Uint8Array(sig));
}

// 生成带签名与时效的 state（防 CSRF），格式：payload.signature
export async function createSignedState(redirectTo = "/"): Promise<string> {
  const payload = b64urlEncode(
    new TextEncoder().encode(
      JSON.stringify({ r: redirectTo, t: Date.now(), n: crypto.randomUUID() }),
    ),
  );
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

// 校验 state（10 分钟有效）
export async function verifySignedState(
  state: string,
): Promise<{ ok: boolean; redirectTo: string }> {
  try {
    const [payload, sig] = state.split(".");
    if (!payload || !sig) return { ok: false, redirectTo: "/" };
    if ((await hmac(payload)) !== sig) return { ok: false, redirectTo: "/" };
    const json = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    if (typeof json.t !== "number" || Date.now() - json.t > 10 * 60 * 1000) {
      return { ok: false, redirectTo: "/" };
    }
    return { ok: true, redirectTo: typeof json.r === "string" ? json.r : "/" };
  } catch {
    return { ok: false, redirectTo: "/" };
  }
}

// 构造 Google 授权页跳转 URL
export async function buildAuthorizeUrl(
  origin: string,
  redirectTo = "/",
): Promise<string> {
  const params = new URLSearchParams({
    client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
    redirect_uri: callbackUrl(origin),
    response_type: "code",
    scope: "openid email profile",
    state: await createSignedState(redirectTo),
    access_type: "online",
    prompt: "select_account",
    include_granted_scopes: "true",
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

export interface GoogleTokens {
  access_token: string;
  id_token?: string;
  expires_in?: number;
}

// 用授权码换取访问令牌
export async function exchangeCodeForTokens(
  code: string,
  origin: string,
): Promise<GoogleTokens> {
  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
      redirect_uri: callbackUrl(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

export interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

// 拉取 Google 用户信息
export async function fetchGoogleUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`userinfo failed: ${res.status}`);
  }
  return await res.json();
}
