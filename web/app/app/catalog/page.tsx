import Link from "next/link";
import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { computeEffectivePrice } from "@/lib/ops/pricing-engine";
import { getOpsStore } from "@/lib/ops/store";
import { statusLabelRu } from "@/lib/ops/status-map";
import { formatRub } from "@/lib/format/money";
import { getActiveReservationForSku } from "@/lib/ops/mutations";

export default function CatalogPage() {
  const s = getOpsStore();
  const rows = Object.values(CATALOG_BY_SKU);

  return (
    <div className="dashboard-grid">
      <div className="dashboard-head">
        <h1>Каталог</h1>
      </div>
      <div className="panel">
        <h2 className="panel__title">Товары</h2>
        <div className="overflow-x-auto">
          <table className="managers-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Название</th>
                <th>Статус склада</th>
                <th>Эфф. цена</th>
                <th>Резерв</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const inv = s.inventory[p.sku];
                const eff = computeEffectivePrice(
                  s.prices[p.sku],
                  p,
                  s.promotions,
                );
                const res = getActiveReservationForSku(s, p.sku);
                return (
                  <tr key={p.sku}>
                    <td>
                      <Link
                        href={`/app/catalog/${encodeURIComponent(p.sku)}`}
                        className="font-mono text-[0.85rem] text-[var(--ink2)] underline-offset-2 hover:underline"
                      >
                        {p.sku}
                      </Link>
                    </td>
                    <td>{p.name}</td>
                    <td>{inv ? statusLabelRu(inv.systemStatus) : "—"}</td>
                    <td>{formatRub(eff.effective)}</td>
                    <td className="text-[var(--muted)]">
                      {res ? res.clientName : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
