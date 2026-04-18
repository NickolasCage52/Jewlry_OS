"use client";

import { useState, useTransition } from "react";
import {
  aiSalesCopilot,
  type CopilotMode,
} from "@/lib/ai/actions";
import type { AiClientFlags } from "@/lib/ai/public-flags";
import { AiOutputBlock } from "@/components/ai/AiOutputBlock";

const CHIPS: { mode: CopilotMode; label: string }[] = [
  { mode: "summarize", label: "Суммировать клиента" },
  { mode: "reply", label: "Что ответить?" },
  { mode: "followup", label: "Повторный контакт" },
  { mode: "similar", label: "Похожие SKU" },
  { mode: "nudge", label: "Мягкий дожим" },
  { mode: "compare", label: "Сравнение" },
  { mode: "budget", label: "Аргументы под бюджет" },
];

export function SalesCopilotPanel({
  clientId,
  flags,
}: {
  clientId: string;
  flags: AiClientFlags;
}) {
  const [text, setText] = useState("");
  const [meta, setMeta] = useState<Parameters<typeof AiOutputBlock>[0]["meta"]>();
  const [pending, startTransition] = useTransition();

  if (!flags.copilot) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
        Копилот отключён флагом.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="font-medium">Копилот продаж</h2>
      <p className="text-xs text-[var(--muted)]">
        Предложения для копирования. Не отправляются автоматически. Контекст: карточка клиента
        + SKU + резерв + похожие позиции.
      </p>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button
            key={c.mode}
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const r = await aiSalesCopilot(clientId, c.mode);
                setText(r.text);
                setMeta(r.meta);
              });
            }}
            className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs hover:bg-[var(--background)] disabled:opacity-50"
          >
            {c.label}
          </button>
        ))}
      </div>
      <AiOutputBlock title="Ответ" text={text} meta={meta} />
    </div>
  );
}
