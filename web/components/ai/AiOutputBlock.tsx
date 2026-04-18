"use client";

import { useCallback, useState } from "react";
import type { AiCompletionMeta } from "@/lib/ai/types";
import { aiProviderRu } from "@/lib/i18n/ru-ui";

export function AiOutputBlock({
  title,
  text,
  meta,
  emptyHint,
  isDraft = true,
}: {
  title: string;
  text: string;
  meta?: AiCompletionMeta;
  emptyHint?: string;
  isDraft?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <div className="rounded-xl border border-dashed border-[#c4b8a8] bg-[#faf8f5] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            {title}
          </div>
          {isDraft && (
            <div className="mt-0.5 text-[10px] text-amber-900/80">
              Черновик AI — проверьте перед отправкой клиенту
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copy}
            disabled={!text}
            className="rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-xs disabled:opacity-40"
          >
            {copied ? "Скопировано" : "Копировать"}
          </button>
        </div>
      </div>
      {meta && (
        <p className="mt-2 text-[10px] text-[var(--muted)]">
          Провайдер: {aiProviderRu(meta.provider)}
          {meta.model ? ` · ${meta.model}` : ""}
          {meta.usedFallback ? " · резервный режим" : ""} · {meta.latencyMs}{" "}
          мс
        </p>
      )}
      <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
        {text ||
          (emptyHint ??
            "Нет данных — задайте запрос или настройте провайдера AI (переменные окружения).")}
      </div>
    </div>
  );
}
