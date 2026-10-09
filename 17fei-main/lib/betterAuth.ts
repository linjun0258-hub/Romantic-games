// better-auth 认证配置（动态导入 + 降级 stub）
// Vercel Deno 运行时以 --cached-only 加载；npm 包不在构建复制清单中，新 npm 包会缺缓存
// 此处使用 top-level await + try/catch：若 better-auth 加载失败，降级为 stub 保证站点其余功能正常
// 老用户可通过 routes 中的 fallback 逻辑继续使用自定义认证（userAuth.ts）

export const googleEnabled = false;

let realAuth: unknown = null;

try {
  const [{ betterAuth }, { default: postgres }, { default: bcryptjs }] = await Promise.all([
    import("npm:better-auth@1.2.8"),
    import("npm:postgres@3.4.5"),
    import("npm:bcryptjs@2.4.3"),
  ]);

  const authSql = postgres(Deno.env.get("DATABASE_URL") ?? "postgres://invalid", {
    prepare: false,
    max: 5,
  });

  realAuth = betterAuth({
    database: authSql,
    secret: Deno.env.get("SESSION_SECRET") ?? "better-auth-dev-secret-change-me",
    baseURL: Deno.env.get("BETTER_AUTH_URL") ?? "https://qqq-omega-ten.vercel.app",
    trustedOrigins: [Deno.env.get("BETTER_AUTH_URL") ?? "https://qqq-omega-ten.vercel.app"],
    emailAndPassword: {
      enabled: true,
      password: {
        hash: (password: string) => bcryptjs.hashSync(password),
        verify: async ({ password, hash }: { password: string; hash: string }) =>
          bcryptjs.compareSync(password, hash),
      },
    },
  });
} catch (e) {
  console.error("[betterAuth] better-auth 初始化失败，认证功能降级:", String(e));
}

export const auth = (realAuth as any) ?? {
  api: {
    signUpEmail: async () => {
      throw new Error("认证服务暂不可用（better-auth 加载失败）");
    },
    signInEmail: async () => {
      throw new Error("认证服务暂不可用（better-auth 加载失败）");
    },
  },
  handler: () => new Response("认证服务暂不可用", { status: 503 }),
};
