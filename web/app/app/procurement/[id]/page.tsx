import Link from "next/link";
import { notFound } from "next/navigation";
import { getOpsStore } from "@/lib/ops/store";
import { formatRub } from "@/lib/format/money";

export default async function ProcurementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = getOpsStore();
  const e = s.procurementEntries.find((x) => x.id === id);
  if (!e) notFound();
  const sup = s.suppliers.find((x) => x.id === e.supplierId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/app/procurement" className="text-sm text-[var(--muted)] hover:underline">
        ← Закупки
      </Link>
      <h1 className="font-display text-2xl">Закупка {e.id}</h1>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm space-y-2">
        <p>Поставщик: {sup?.name ?? e.supplierId}</p>
        <p>
          Курс: {e.fxRate} · Итого: <strong>{formatRub(e.rubTotal)}</strong>
        </p>
        <p className="text-[var(--muted)]">{e.comment}</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">Строки</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {e.lines.map((l) => (
            <li key={l.id} className="flex justify-between border-b border-[var(--border)] pb-2">
              <span>{l.label}</span>
              <span>
                {l.qty} x {l.unitPriceForeign} {l.currency}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--muted)]">
        Расчёт: сумма в валюте x курс на дату записи (MVP). Адаптер курса:{" "}
        {s.currency.source}.
      </div>
    </div>
  );
}
