import Link from "next/link";
import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { getOpsStore } from "@/lib/ops/store";
import { statusLabelRu } from "@/lib/ops/status-map";
import { getActiveReservationForSku } from "@/lib/ops/mutations";

export default function StockPage() {
  const s = getOpsStore();
  const rows = Object.keys(s.inventory).map((sku) => {
    const inv = s.inventory[sku];
    const total = inv.locations.reduce((a, l) => a + l.qty, 0);
    const res = getActiveReservationForSku(s, sku);
    const cat = CATALOG_BY_SKU[sku];
    return { sku, inv, total, res, cat };
  });

  const low = rows.filter(
    (r) => r.inv.systemStatus === "in_stock" && r.total > 0 && r.total <= 2,
  );
  const reserved = rows.filter((r) => r.res);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Склад</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <div className="font-medium">Низкий остаток</div>
          <ul className="mt-2 space-y-1">
            {low.map((r) => (
              <li key={r.sku}>
                <Link href={`/app/stock/${encodeURIComponent(r.sku)}`} className="underline">
                  {r.sku}
                </Link>{" "}
                · {r.total} шт.
              </li>
            ))}
            {low.length === 0 && (
              <li className="text-[var(--muted)]">Нет позиций в зоне внимания</li>
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <div className="font-medium">В резерве</div>
          <ul className="mt-2 space-y-1">
            {reserved.map((r) => (
              <li key={r.sku}>
                {r.sku} · {r.res?.clientName}
              </li>
            ))}
            {reserved.length === 0 && (
              <li className="text-[var(--muted)]">Нет активных резервов</li>
            )}
          </ul>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Название</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Всего</th>
              <th className="px-3 py-2">Резерв</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku} className="border-b border-[var(--border)]">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link
                    href={`/app/stock/${encodeURIComponent(r.sku)}`}
                    className="hover:underline"
                  >
                    {r.sku}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.cat?.name ?? "—"}</td>
                <td className="px-3 py-2">{statusLabelRu(r.inv.systemStatus)}</td>
                <td className="px-3 py-2">{r.total}</td>
                <td className="px-3 py-2 text-xs">
                  {r.res ? r.res.clientName : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
