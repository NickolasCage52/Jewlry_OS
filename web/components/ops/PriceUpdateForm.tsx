"use client";

import { useState } from "react";
import { actionSetMasterPrice } from "@/lib/ops/actions";

export function PriceUpdateForm({
  sku,
  current,
  canEdit,
}: {
  sku: string;
  current: number;
  canEdit: boolean;
}) {
  const [value, setValue] = useState(String(current));
  const [confirmed, setConfirmed] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!canEdit) return null;

  return (
    <form
      className="mt-4 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg(null);
        const n = Number(value);
        if (Number.isNaN(n)) {
          setMsg("Некорректное число");
          return;
        }
        const r = await actionSetMasterPrice(sku, n, confirmed);
        if (r.ok) setMsg("Сохранено");
        else if (r.error === "not_confirmed")
          setMsg("Подтвердите изменение галочкой");
        else setMsg("Ошибка");
      }}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        Изменить базовую цену
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        Подтверждаю изменение цены
      </label>
      <button
        type="submit"
        className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)]"
      >
        Сохранить
      </button>
      {msg && <p className="text-sm text-[var(--muted)]">{msg}</p>}
    </form>
  );
}
