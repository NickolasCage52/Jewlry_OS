import Link from "next/link";
import { getCatalogProductOrStub } from "@/lib/mock/catalog-data";
import { getSession } from "@/lib/auth/session";
import { roleHasPermission } from "@/lib/auth/access";
import { getOpsStore } from "@/lib/ops/store";
import { statusLabelRu } from "@/lib/ops/status-map";
import { StockStatusForm } from "@/components/ops/StockStatusForm";
import { inventoryLocationKindRu } from "@/lib/i18n/ru-ui";

export default async function StockSkuPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku: raw } = await params;
  const sku = decodeURIComponent(raw);
  const session = await getSession();
  const canAdjust =
    !!session && roleHasPermission(session.role, "inventory:adjust");

  const s = getOpsStore();
  const inv = s.inventory[sku];
  const p = getCatalogProductOrStub(sku);
  const logs = s.stockLog.filter((l) => l.sku === sku).slice(0, 30);

  if (!inv) {
    return <p className="text-sm text-[var(--muted)]">SKU не в складском индексе</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/app/stock" className="text-sm text-[var(--muted)] hover:underline">
        ← Склад
      </Link>
      <div>
        <h1 className="font-display text-3xl">{p.name}</h1>
        <p className="font-mono text-sm">{sku}</p>
        <p className="mt-2 text-sm">Статус: {statusLabelRu(inv.systemStatus)}</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">Локации</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {inv.locations.map((l) => (
            <li key={l.locationId} className="flex justify-between">
              <span>
                {l.locationName} ({inventoryLocationKindRu(l.kind)})
              </span>
              <span>
                {l.qty} шт. · {l.updatedBy}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {canAdjust && (
        <StockStatusForm sku={sku} current={inv.systemStatus} />
      )}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">Журнал изменений</h2>
        <ul className="mt-2 max-h-64 space-y-2 overflow-auto text-xs">
          {logs.map((l) => (
            <li key={l.id} className="border-b border-[var(--border)] pb-2">
              {l.at} · {l.by}: {l.detail}
              {l.prevStatus && l.nextStatus ? (
                <span className="text-[var(--muted)]">
                  {" "}
                  ({l.prevStatus} → {l.nextStatus})
                </span>
              ) : null}
            </li>
          ))}
          {logs.length === 0 && (
            <li className="text-[var(--muted)]">Пока только посевочные данные</li>
          )}
        </ul>
      </div>
    </div>
  );
}
