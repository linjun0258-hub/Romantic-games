// 姿势卡片列表（islands）：图片位与数据解耦
// 图片放置目录：17fei-main/static/positions/<id>.jpg
// 文件不存在或加载失败时，卡片自动回退为虚线占位框（不破图、不塌布局）
import { useState } from "preact/hooks";
import type { PositionItem } from "../lib/positions.ts";

interface Props {
  positions: PositionItem[];
}

const placeholderBox =
  "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;height:100%;width:100%;box-sizing:border-box;padding:8px;text-align:center;color:#f472b6;background:#fdf2f8;border:2px dashed #fbcfe8;";

function Placeholder({ id }: { id: string }) {
  return (
    <div style={placeholderBox}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span style="font-size:11px;line-height:1.3;">待添加图片</span>
      <code style="font-size:10px;opacity:.65;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        {id}.jpg
      </code>
    </div>
  );
}

function Card(
  { item, onLoaded }: { item: PositionItem; onLoaded: () => void },
) {
  const [broken, setBroken] = useState(false);
  const [reported, setReported] = useState(false);
  const showImg = item.illustration !== "" && !broken;

  return (
    <figure class="overflow-hidden rounded-lg bg-white shadow">
      <div
        style="position:relative;width:100%;aspect-ratio:3 / 4;overflow:hidden;background:#fdf2f8;"
      >
        {showImg
          ? (
            <img
              src={item.illustration}
              alt={item.name}
              loading="lazy"
              decoding="async"
              style="height:100%;width:100%;object-fit:cover;display:block;"
              onError={() => setBroken(true)}
              onLoad={() => {
                if (!reported) {
                  setReported(true);
                  onLoaded();
                }
              }}
            />
          )
          : <Placeholder id={item.id} />}
      </div>
      <figcaption
        style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;"
      >
        <span
          class="text-sm font-medium"
          style="color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
          title={item.name}
        >
          {item.name}
        </span>
        {item.tags && item.tags.length > 0
          ? (
            <span
              style="flex-shrink:0;border-radius:9999px;background:#fdf2f8;padding:2px 8px;font-size:10px;font-weight:500;color:#db2777;"
            >
              {item.tags[0]}
            </span>
          )
          : null}
      </figcaption>
    </figure>
  );
}

export default function PositionList({ positions }: Props) {
  const [keyword, setKeyword] = useState("");
  const [loaded, setLoaded] = useState(0);
  const total = positions.length;
  const kw = keyword.trim().toLowerCase();
  const shown = kw === ""
    ? positions
    : positions.filter((p) =>
      p.name.toLowerCase().includes(kw) || p.id.includes(kw)
    );

  return (
    <>
      <div
        style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px;"
        class="sm:flex-row sm:items-center sm:justify-between"
      >
        <div style="display:flex;align-items:baseline;gap:8px;">
          <h1 class="text-lg font-bold" style="color:#1f2937;margin:0;">
            姿势大全
          </h1>
          <span class="text-xs" style="color:#6b7280;">
            已配图 <strong style="color:#db2777;">{loaded}</strong> / {total}
          </span>
        </div>
        <input
          type="search"
          value={keyword}
          onInput={(e) => setKeyword((e.target as HTMLInputElement).value)}
          placeholder="搜索名称…"
          aria-label="搜索姿势名称"
          class="rounded-full border"
          style="width:100%;border-color:#e5e7eb;background:#fff;padding:8px 16px;font-size:14px;color:#374151;outline:none;box-sizing:border-box;max-width:14rem;"
        />
      </div>

      {shown.length === 0
        ? (
          <p class="text-sm text-gray-500" style="padding:64px 0;text-align:center;">
            没有匹配「{keyword}」的条目
          </p>
        )
        : (
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((item) => (
              <Card
                key={item.id}
                item={item}
                onLoaded={() => setLoaded((n) => n + 1)}
              />
            ))}
          </div>
        )}
    </>
  );
}
