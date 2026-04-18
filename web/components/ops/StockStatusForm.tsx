"use client";

import { useState } from "react";
import { actionSetStockStatus } from "@/lib/ops/actions";
import type { InventorySystemStatus } from "@/lib/ops/types";

const OPTIONS: { v: InventorySystemStatus; label: string }[] = [
  { v: "in_stock", label: "В наличии" },
  { v: "reserved", label: "Резерв" },
  { v: "made_to_order", label: "Под заказ" },
  { v: "out", label: "Нет" },
  { v: "production", label: "В производстве" },
  { v: "awaiting_stone", label: "Ожидает вставку" },
  { v: "sold_archive", label: "Продан / архив" },
];

export function StockStatusForm({ sku, current }: { sku: string; current: InventorySystemStatus }) {
  const [status, setStatus] = useState(current);
  const [detail, setDetail] = useState("Корректировка через OS");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="space-y-2 rounded-xl border border-[var(--border)] p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg(null);
        const r = await actionSetStockStatus(sku, status, detail);
        setMsg(r.ok ? "Ок" : "Ошибка");
      }}
    >
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as InventorySystemStatus)}
        className="w-full rounded-lg border border-[var(--border)] px-2 py-2 text-sm"
      >
        {OPTIONS.map((o) => (
          <option key={o.v} value={o.v}>
            {o.label}
          </option>
        ))}
      </select>
      <input
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] px-2 py-2 text-sm"
        placeholder="Комментарий"
      />
      <button
        type="submit"
        className="rounded-lg bg-[var(--foreground)] px-3 py-2 text-sm text-[var(--background)]"
      >
        Обновить статус
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
