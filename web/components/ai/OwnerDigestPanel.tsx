"use client";

import { useState, useTransition } from "react";
import { aiOwnerDigest } from "@/lib/ai/actions";
import type { AiClientFlags } from "@/lib/ai/public-flags";
import { AiOutputBlock } from "@/components/ai/AiOutputBlock";
import { aiProviderRu } from "@/lib/i18n/ru-ui";

export function OwnerDigestPanel({ flags }: { flags: AiClientFlags }) {
  const [text, setText] = useState("");
  const [meta, setMeta] = useState<Parameters<typeof AiOutputBlock>[0]["meta"]>();
  const [pending, startTransition] = useTransition();

  if (!flags.ownerDigest) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
        AI-дайджест отключён флагом.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">AI-дайджест собственника</h2>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const r = await aiOwnerDigest();
              setText(r.text);
              setMeta(r.meta);
            });
          }}
          className="rounded-lg bg-[var(--foreground)] px-3 py-1.5 text-xs text-[var(--background)] disabled:opacity-50"
        >
          {pending ? "…" : "Обновить"}
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Основано только на KPI, воронке, сигналах и ленте из OS (см. контекст в промпте).
        Режим: {aiProviderRu(flags.provider)}.
      </p>
      <AiOutputBlock title="Сводка" text={text} meta={meta} />
    </div>
  );
}
