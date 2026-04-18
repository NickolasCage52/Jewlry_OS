"use client";

import { useState } from "react";
import { actionCurrencyOverride, actionRefreshCurrency } from "@/lib/ops/actions";

export function CurrencyPanel({
  rate,
  manualOverride,
  updatedAt,
  source,
}: {
  rate: number;
  manualOverride: number | null;
  updatedAt: string;
  source: string;
}) {
  const [v, setV] = useState(String(manualOverride ?? rate));
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm space-y-3">
      <div>
        <div className="text-xs text-[var(--muted)]">USD → RUB</div>
        <div className="font-display text-2xl">{rate}</div>
        <div className="text-xs text-[var(--muted)]">
          {source} · {new Date(updatedAt).toLocaleString("ru-RU")}
        </div>
        {manualOverride != null && (
          <div className="text-xs text-amber-800">Ручной оверрайд активен</div>
        )}
      </div>
      <button
        type="button"
        className="rounded-lg border border-[var(--border)] px-3 py-1.5"
        onClick={async () => {
          await actionRefreshCurrency();
          setMsg("Курс обновлён (заглушка)");
        }}
      >
        Обновить из адаптера
      </button>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const n = Number(v);
          if (Number.isNaN(n)) return;
          await actionCurrencyOverride(n);
          setMsg("Оверрайд сохранён");
        }}
      >
        <label className="text-xs">
          Оверрайд
          <input
            value={v}
            onChange={(e) => setV(e.target.value)}
            className="ml-1 w-24 rounded border px-2 py-1"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-[var(--foreground)] px-3 py-1.5 text-[var(--background)]"
        >
          Зафиксировать
        </button>
      </form>
      {msg && <p className="text-xs text-[var(--muted)]">{msg}</p>}
    </div>
  );
}
