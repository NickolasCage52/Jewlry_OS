"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MEDIA_ASSETS } from "@/lib/mock/media-assets";
import type { MediaAsset } from "@/lib/types/media";
import { mediaAssetTypeRu } from "@/lib/i18n/ru-ui";

const CONTENT_STATS = { totalMaterials: 1247 };

const CHANNEL_CHIPS: { id: string; label: string; match: (i: MediaAsset) => boolean }[] = [
  { id: "all", label: "Все", match: () => true },
  { id: "photo", label: "Фото", match: (i) => i.type === "photo" },
  { id: "video", label: "Видео", match: (i) => i.type === "video" },
  {
    id: "ads",
    label: "Для рекламы",
    match: (i) => i.channel.some((c) => c.toLowerCase().includes("реклам")),
  },
  {
    id: "avito",
    label: "Авито",
    match: (i) => i.channel.some((c) => c.toLowerCase().includes("авито")),
  },
];

function matchesSearch(item: MediaAsset, q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const blob = [item.name, item.sku, item.category, item.metal, item.stone, ...item.channel]
    .join(" ")
    .toLowerCase();
  return blob.includes(s);
}

export function ContentCenterClient() {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("all");

  const filtered = useMemo(() => {
    const matcher = CHANNEL_CHIPS.find((c) => c.id === chip)?.match ?? (() => true);
    return MEDIA_ASSETS.filter((i) => matcher(i) && matchesSearch(i, q));
  }, [chip, q]);

  return (
    <>
      <header className="content-header">
        <div>
          <h1>Контент-центр</h1>
          <div className="content-header__sub">
            <span>{CONTENT_STATS.totalMaterials.toLocaleString("ru-RU")}</span>{" "}
            материалов · обновлено сегодня
          </div>
        </div>
        <button type="button" className="btn btn--gold">
          + Загрузить
        </button>
      </header>

      <div className="content-ux-banner">
        <div className="content-ux-banner__icon">{"\u2726"}</div>
        <div className="content-ux-banner__text">
          <strong>Искали в папках 15 минут — находите за 5 секунд</strong>
          <p>
            Единый поиск по артикулу, камню и каналу. Материалы привязаны к SKU:
            менеджер и маркетинг видят одну версию правды.
          </p>
        </div>
      </div>

      <div className="content-toolbar">
        <input
          type="search"
          className="content-search"
          placeholder="Поиск по названию, SKU, каналу…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Поиск материалов"
        />
        <div className="filter-chips">
          {CHANNEL_CHIPS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`filter-chip ${chip === c.id ? "is-active" : ""}`.trim()}
              onClick={() => setChip(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-illustration">
          <svg
            className="empty-illustration__art"
            viewBox="0 0 120 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <rect x="10" y="20" width="100" height="60" rx="8" fill="var(--border)" />
          </svg>
          <p>
            <strong>Материалы не найдены</strong>
          </p>
          <p>Сбросьте фильтры или измените запрос</p>
        </div>
      ) : (
        <div className="media-grid media-grid--3">
          {filtered.map((m) => (
            <Link
              key={m.id}
              href={`/app/content/${m.id}`}
              className="media-card block text-inherit no-underline"
            >
              <div className="media-card__thumb-wrap">
                <div
                  className="media-card__thumb"
                  style={{ background: m.color, minHeight: 120 }}
                />
              </div>
              <div className="media-card__body">
                <div className="media-card__title">{m.name}</div>
                <div className="media-card__sku">
                  {m.sku} · {mediaAssetTypeRu(m.type)} · {m.date}
                </div>
                <div className="media-card__tags">
                  <span className="tag">{m.category}</span>
                  <span className="tag">{m.metal}</span>
                </div>
                <div className="media-card__meta">{m.channel.join(" · ")}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
