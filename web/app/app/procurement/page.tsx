import Link from "next/link";
import { getOpsStore } from "@/lib/ops/store";
import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { formatRub } from "@/lib/format/money";
import { CurrencyPanel } from "@/components/ops/CurrencyPanel";
import { ContextualSops } from "@/components/scale/ContextualSops";

function needToBuy(): { sku: string; reason: string }[] {
  const s = getOpsStore();
  const out: { sku: string; reason: string }[] = [];
  for (const sku of Object.keys(s.inventory)) {
    const inv = s.inventory[sku];
    const total = inv.locations.reduce((a, l) => a + l.qty, 0);
    const cat = CATALOG_BY_SKU[sku];
    if (
      inv.systemStatus === "made_to_order" &&
      (cat?.availability.inbound ?? 0) === 0 &&
      total === 0
    ) {
      out.push({ sku, reason: "Под заказ, нет покрытия складом" });
    }
    if (inv.systemStatus === "in_stock" && total <= 1) {
      out.push({ sku, reason: "Критичный остаток" });
    }
  }
  return out.slice(0, 12);
}

export default function ProcurementPage() {
  const s = getOpsStore();
  const shortage = needToBuy();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Закупки</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <CurrencyPanel
          rate={s.currency.rate}
          manualOverride={s.currency.manualOverride}
          updatedAt={s.currency.updatedAt}
          source={s.currency.source}
        />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <h2 className="font-medium">Поставщики</h2>
          <ul className="mt-2 space-y-2">
            {s.suppliers.map((sup) => (
              <li key={sup.id} className="flex justify-between">
                <span>{sup.name}</span>
                <span className="text-xs text-[var(--muted)]">{sup.type}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm">
        <h2 className="font-medium text-red-900">Нужно закупить / внимание</h2>
        <ul className="mt-2 space-y-1">
          {shortage.map((x) => (
            <li key={x.sku}>
              <Link href={`/app/catalog/${encodeURIComponent(x.sku)}`} className="underline">
                {x.sku}
              </Link>{" "}
              — {x.reason}
            </li>
          ))}
          {shortage.length === 0 && (
            <li className="text-[var(--muted)]">Нет критичных сигналов (демо-правила)</li>
          )}
        </ul>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="font-medium">Позиции камней (учёт)</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {s.stones.map((st) => (
            <li key={st.id} className="flex justify-between border-b border-[var(--border)] pb-2">
              <span>
                {st.stoneType} {st.shape} · {st.carat} ct x{st.qty}
              </span>
              <span className="text-[var(--muted)]">
                {st.purchasePrice} {st.currency} ·{" "}
                {formatRub(Math.round(st.purchasePrice * s.currency.rate * st.qty))}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="mb-2 font-medium">Закупочные записи</h2>
        <ul className="space-y-2">
          {s.procurementEntries.map((e) => (
            <li key={e.id}>
              <Link
                href={`/app/procurement/${e.id}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 block hover:bg-[var(--background)]"
              >
                <div className="flex justify-between text-sm">
                  <span className="font-mono text-xs">{e.id}</span>
                  <span>{formatRub(e.rubTotal)}</span>
                </div>
                <div className="text-xs text-[var(--muted)]">
                  {e.createdAt} · {e.createdBy}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <ContextualSops surface="procurement" />
    </div>
  );
}
