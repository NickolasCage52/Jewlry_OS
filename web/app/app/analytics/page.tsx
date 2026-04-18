import { funnelData, managers } from "@/lib/mock/dashboard";
import { inventoryAnalyticsSummary, marketingStatic } from "@/lib/services/ops-analytics";
import { getOpsStore } from "@/lib/ops/store";
import { formatRub } from "@/lib/format/money";
import { statusLabelRu } from "@/lib/ops/status-map";

export default function AnalyticsPage() {
  const m = marketingStatic();
  const inv = inventoryAnalyticsSummary();
  const s = getOpsStore();
  const procBySup: Record<string, number> = {};
  for (const e of s.procurementEntries) {
    procBySup[e.supplierId] = (procBySup[e.supplierId] ?? 0) + e.rubTotal;
  }

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl">Аналитика</h1>
      <section>
        <h2 className="text-lg font-medium">Маркетинг</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
            <div className="text-xs text-[var(--muted)]">Лиды по источникам</div>
            <ul className="mt-2 space-y-1">
              {m.leadsBySource.map((x) => (
                <li key={x.label} className="flex justify-between">
                  {x.label}
                  <span>{x.value}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
            <div className="text-xs text-[var(--muted)]">Конверсия</div>
            <ul className="mt-2 space-y-1">
              {m.conversionBySource.map((x) => (
                <li key={x.label} className="flex justify-between">
                  {x.label}
                  <span>{Math.round(x.rate * 100)}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--muted)]">
              Расходы (оценка): {formatRub(m.costSummaryRub)}
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-medium">Продажи</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
            <div className="text-xs text-[var(--muted)]">Воронка</div>
            <ul className="mt-2 space-y-1">
              {funnelData.map((f) => (
                <li key={f.stage} className="flex justify-between">
                  {f.stage}
                  <span>{f.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
            <div className="text-xs text-[var(--muted)]">Менеджеры</div>
            <ul className="mt-2 space-y-1">
              {managers.map((x) => (
                <li key={x.name} className="flex justify-between">
                  {x.name}
                  <span className="text-[var(--muted)]">
                    {x.deals} · {formatRub(x.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-medium">Склад</h2>
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <p>Активных резервов: {inv.reservedSkus}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Распределение статусов:</p>
          <ul className="mt-1 space-y-1">
            {(Object.keys(inv.dist) as (keyof typeof inv.dist)[]).map((k) => (
              <li key={k} className="flex justify-between">
                {statusLabelRu(k)}
                <span>{inv.dist[k]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-medium">Закупки</h2>
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <ul className="space-y-1">
            {Object.entries(procBySup).map(([id, sum]) => {
              const name = s.suppliers.find((x) => x.id === id)?.name ?? id;
              return (
                <li key={id} className="flex justify-between">
                  {name}
                  <span>{formatRub(sum)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
