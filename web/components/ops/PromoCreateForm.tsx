"use client";

import { useState } from "react";
import { actionAddPromotion } from "@/lib/ops/actions";
import type { Promotion } from "@/lib/ops/types";

export function PromoCreateForm() {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="space-y-3 rounded-xl border border-[var(--border)] p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = String(fd.get("name") ?? "");
        const scopeType = fd.get("scopeType") as Promotion["scopeType"];
        const scopeValue = String(fd.get("scopeValue") ?? "");
        const discountType = fd.get("discountType") as Promotion["discountType"];
        const value = Number(fd.get("value"));
        const startAt = new Date(String(fd.get("start"))).toISOString();
        const endAt = new Date(String(fd.get("end"))).toISOString();
        await actionAddPromotion({
          name,
          scopeType,
          scopeValue,
          discountType,
          value,
          startAt,
          endAt,
        });
        setMsg("Акция добавлена");
        e.currentTarget.reset();
      }}
    >
      <div className="text-sm font-medium">Новая акция</div>
      <input
        name="name"
        required
        placeholder="Название"
        className="w-full rounded-lg border border-[var(--border)] px-2 py-2 text-sm"
      />
      <div className="flex gap-2">
        <select
          name="scopeType"
          className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"
        >
          <option value="collection">Коллекция</option>
          <option value="sku">SKU</option>
          <option value="category">Категория (строка)</option>
        </select>
        <input
          name="scopeValue"
          required
          placeholder="Значение"
          className="flex-1 rounded-lg border border-[var(--border)] px-2 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <select
          name="discountType"
          className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"
        >
          <option value="percent">Процент</option>
          <option value="fixed">Фиксированная сумма (руб.)</option>
          <option value="manual_override">Цена вручную</option>
        </select>
        <input
          name="value"
          type="number"
          required
          className="w-28 rounded-lg border border-[var(--border)] px-2 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2 text-xs">
        <label>
          Старт
          <input type="date" name="start" required className="ml-1 rounded border px-1" />
        </label>
        <label>
          Конец
          <input type="date" name="end" required className="ml-1 rounded border px-1" />
        </label>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)]"
      >
        Создать
      </button>
      {msg && <p className="text-sm text-green-800">{msg}</p>}
    </form>
  );
}
