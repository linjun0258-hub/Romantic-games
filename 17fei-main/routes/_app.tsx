import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="情侣飞行棋在线玩：支持双人同屏的情侣互动小游戏，包含基础版与恋爱版棋盘，适合不同阶段的情侣一起玩。"
        />
        <title>情侣飞行棋 - 情侣互动小游戏</title>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
