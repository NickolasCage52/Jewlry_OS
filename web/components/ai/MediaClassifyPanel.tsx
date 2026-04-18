"use client";

import { useState, useTransition } from "react";
import { aiSuggestMediaClassification } from "@/lib/ai/actions";
import type { AiClientFlags } from "@/lib/ai/public-flags";
import type { MediaAsset } from "@/lib/types/media";
import { AiOutputBlock } from "@/components/ai/AiOutputBlock";

export function MediaClassifyPanel({
  asset,
  flags,
}: {
  asset: MediaAsset;
  flags: AiClientFlags;
}) {
  const [pending, startTransition] = useTransition();
  const [tags, setTags] = useState<string[]>(asset.tags ?? []);
  const [category, setCategory] = useState(asset.category);
  const [confidence, setConfidence] = useState<string>("");
  const [note, setNote] = useState("");
  const [aiExtra, setAiExtra] = useState("");
  const [meta, setMeta] = useState<Parameters<typeof AiOutputBlock>[0]["meta"]>();

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-[#c4b8a8] bg-[#faf8f5] p-4">
      <h2 className="text-sm font-medium">Классификация (подсказка)</h2>
      <p className="text-xs text-[var(--muted)]">
        Теги не применяются автоматически — только предложение. Низкая уверенность помечается
        явно.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const r = await aiSuggestMediaClassification({
              name: asset.name,
              sku: asset.sku,
              type: asset.type,
            });
            setTags(r.ruleBased.tags);
            setCategory(r.ruleBased.category);
            setConfidence(r.ruleBased.confidence);
            setNote(r.ruleBased.note);
            setAiExtra(r.aiText ?? "");
            if (r.aiText) {
              setMeta({
                provider: flags.classify ? "mock" : "none",
                latencyMs: 0,
                usedFallback: !flags.classify,
              });
            }
          });
        }}
        className="rounded-lg bg-[var(--foreground)] px-3 py-1.5 text-xs text-[var(--background)] disabled:opacity-50"
      >
        {pending ? "…" : "Предложить теги"}
      </button>
      <div className="text-sm">
        <div>
          <span className="text-[var(--muted)]">Категория:</span> {category}
        </div>
        <div>
          <span className="text-[var(--muted)]">Уверенность:</span> {confidence || "—"}
        </div>
        <div className="mt-1">
          <span className="text-[var(--muted)]">Теги:</span> {tags.join(", ") || "—"}
        </div>
        {note && <p className="mt-2 text-xs text-[var(--muted)]">{note}</p>}
      </div>
      {aiExtra ? (
        <AiOutputBlock title="Доп. комментарий модели" text={aiExtra} meta={meta} />
      ) : null}
    </div>
  );
}
