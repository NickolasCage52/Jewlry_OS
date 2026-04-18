import Link from "next/link";
import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { formatRub } from "@/lib/format/money";
import { computeEffectivePrice } from "@/lib/ops/pricing-engine";
import { getOpsStore } from "@/lib/ops/store";
import { PromoCreateForm } from "@/components/ops/PromoCreateForm";
import { roleHasPermission } from "@/lib/auth/access";
import { getSession } from "@/lib/auth/session";
import {
  priceSourceRu,
  promoDiscountTypeRu,
  promoScopeTypeRu,
  promoStatusRu,
} from "@/lib/i18n/ru-ui";

export default async function PricingPage() {
  const s = getOpsStore();
  const session = await getSession();
  const canPromo = session && roleHasPermission(session.role, "promo:manage");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Цены и акции</h1>
        <p className="text-sm text-[var(--muted)]">
          Базовая цена, эффективная цена, промо и история изменений
        </p>
      </div>
      {canPromo && <PromoCreateForm />}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="font-medium">Активные акции</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {s.promotions.map((p) => (
            <li key={p.id} className="flex justify-between border-b border-[var(--border)] pb-2">
              <span>
                {p.name} · {promoScopeTypeRu(p.scopeType)}={p.scopeValue} ·{" "}
                {promoDiscountTypeRu(p.discountType)} {p.value}
              </span>
              <span className="text-[var(--muted)]">{promoStatusRu(p.status)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Базовая</th>
              <th className="px-3 py-2">Эффективно</th>
              <th className="px-3 py-2">Источник</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(CATALOG_BY_SKU).map((p) => {
              const row = s.prices[p.sku];
              const eff = computeEffectivePrice(row, p, s.promotions);
              return (
                <tr key={p.sku} className="border-b border-[var(--border)]">
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link href={`/app/catalog/${encodeURIComponent(p.sku)}`} className="hover:underline">
                      {p.sku}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{formatRub(row?.masterPrice ?? 0)}</td>
                  <td className="px-3 py-2">{formatRub(eff.effective)}</td>
                  <td className="px-3 py-2 text-xs text-[var(--muted)]">
                    {row?.source ? priceSourceRu(row.source) : "—"} · {row?.updatedBy}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
