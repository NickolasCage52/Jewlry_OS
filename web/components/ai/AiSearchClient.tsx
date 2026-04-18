"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  aiRunStructuredSearch,
  aiSearchNarrative,
} from "@/lib/ai/actions";
import type { AiClientFlags } from "@/lib/ai/public-flags";
import type { StructuredSearchResult } from "@/lib/ai/search/structured";
import { AiOutputBlock } from "@/components/ai/AiOutputBlock";
import { formatRub } from "@/lib/format/money";
import { aiProviderRu } from "@/lib/i18n/ru-ui";

export function AiSearchClient({ flags }: { flags: AiClientFlags }) {
  const [q, setQ] = useState("");
  const [structured, setStructured] = useState<StructuredSearchResult | null>(null);
  const [narrative, setNarrative] = useState("");
  const [nMeta, setNMeta] = useState<Parameters<typeof AiOutputBlock>[0]["meta"]>();
  const [pending, startTransition] = useTransition();

  const totalHits = useMemo(() => {
    if (!structured) return 0;
    return (
      structured.products.length +
      structured.media.length +
      structured.faq.length +
      structured.clients.length
    );
  }, [structured]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <label className="block text-sm font-medium">Запрос</label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="например: сапфир кольцо резерв"
            className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={pending || q.trim().length < 2}
            onClick={() => {
              startTransition(async () => {
                const r = await aiRunStructuredSearch(q);
                if (r.ok) setStructured(r.data);
                else setStructured(null);
              });
            }}
            className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)] disabled:opacity-40"
          >
            Структурный поиск
          </button>
          <button
            type="button"
            disabled={pending || !structured || !flags.search}
            onClick={() => {
              startTransition(async () => {
                const r = await aiSearchNarrative(q, structured);
                setNarrative(r.text);
                setNMeta(r.meta);
              });
            }}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm disabled:opacity-40"
          >
            AI пояснение
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Минимум 2 символа. Сначала структурный поиск, затем опционально пояснение (провайдер:{" "}
          {aiProviderRu(flags.provider)}).
        </p>
      </div>

      {structured && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="text-sm font-medium">Товары ({structured.products.length})</h3>
            <ul className="mt-2 max-h-56 space-y-2 overflow-auto text-sm">
              {structured.products.map((p) => (
                <li key={p.sku}>
                  <Link href={`/app/catalog/${encodeURIComponent(p.sku)}`} className="underline">
                    {p.sku}
                  </Link>{" "}
                  · {p.name} · {formatRub(p.effectivePrice)} · {p.status}
                </li>
              ))}
              {structured.products.length === 0 && (
                <li className="text-[var(--muted)]">Нет совпадений</li>
              )}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="text-sm font-medium">Медиа ({structured.media.length})</h3>
            <ul className="mt-2 max-h-56 space-y-2 overflow-auto text-sm">
              {structured.media.map((m) => (
                <li key={m.id}>
                  <Link href={`/app/content/${m.id}`} className="underline">
                    {m.name}
                  </Link>{" "}
                  · {m.sku}
                </li>
              ))}
              {structured.media.length === 0 && (
                <li className="text-[var(--muted)]">Нет совпадений</li>
              )}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="text-sm font-medium">ЧаВо ({structured.faq.length})</h3>
            <ul className="mt-2 max-h-56 space-y-2 overflow-auto text-sm">
              {structured.faq.map((f) => (
                <li key={f.id}>
                  <Link href="/app/faq" className="underline">
                    {f.q}
                  </Link>
                  <div className="text-xs text-[var(--muted)]">{f.snippet}</div>
                </li>
              ))}
              {structured.faq.length === 0 && (
                <li className="text-[var(--muted)]">Нет совпадений</li>
              )}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="text-sm font-medium">Клиенты ({structured.clients.length})</h3>
            <ul className="mt-2 max-h-56 space-y-2 overflow-auto text-sm">
              {structured.clients.map((c) => (
                <li key={c.id}>
                  <Link href={`/app/sales/${c.id}`} className="underline">
                    {c.name}
                  </Link>
                  <div className="text-xs text-[var(--muted)]">{c.snippet}</div>
                </li>
              ))}
              {structured.clients.length === 0 && (
                <li className="text-[var(--muted)]">Нет совпадений</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {structured && totalHits === 0 && q.length >= 2 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Ничего не найдено. Попробуйте другие слова или откройте каталог вручную.
        </div>
      )}

      {(narrative || nMeta) && (
        <AiOutputBlock title="AI пояснение к результатам" text={narrative} meta={nMeta} isDraft />
      )}
    </div>
  );
}
