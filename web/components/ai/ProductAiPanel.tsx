"use client";

import { useState, useTransition } from "react";
import { aiGenerateProductCopy } from "@/lib/ai/actions";
import type { AiClientFlags } from "@/lib/ai/public-flags";
import { AiOutputBlock } from "@/components/ai/AiOutputBlock";
import Link from "next/link";
import type { SimilarRow } from "@/lib/ai/recommend/similar-products";

export function ProductAiPanel({
  sku,
  flags,
  similar,
}: {
  sku: string;
  flags: AiClientFlags;
  similar: SimilarRow[];
}) {
  const [text, setText] = useState("");
  const [meta, setMeta] = useState<Parameters<typeof AiOutputBlock>[0]["meta"]>();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {flags.recommend && similar.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="text-sm font-medium">Похожие товары (эвристика)</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {similar.map((r) => (
              <li key={r.sku} className="flex flex-wrap justify-between gap-2 border-b border-[var(--border)] pb-2">
                <Link
                  href={`/app/catalog/${encodeURIComponent(r.sku)}`}
                  className="font-mono text-xs underline"
                >
                  {r.sku}
                </Link>
                <span className="text-xs text-[var(--muted)]">{r.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {flags.generate && (
        <div className="rounded-xl border border-dashed border-[#c4b8a8] bg-[#faf8f5] p-4">
          <h3 className="text-sm font-medium">Генерация описаний</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Черновики для каналов. Публикация только после вашей правки.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                ["avito", "Авито"],
                ["social", "Соцсети"],
                ["short", "Коротко"],
                ["manager", "Для менеджера"],
              ] as const
            ).map(([ch, label]) => (
              <button
                key={ch}
                type="button"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const r = await aiGenerateProductCopy(sku, ch);
                    setText(r.text);
                    setMeta(r.meta);
                  });
                }}
                className="rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-xs disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <AiOutputBlock title="Текст" text={text} meta={meta} />
          </div>
        </div>
      )}
    </div>
  );
}
