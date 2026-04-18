import Link from "next/link";
import { getCatalogProductOrStub } from "@/lib/mock/catalog-data";
import { roleHasPermission } from "@/lib/auth/access";
import { getSession } from "@/lib/auth/session";
import { formatRub } from "@/lib/format/money";
import { computeEffectivePrice } from "@/lib/ops/pricing-engine";
import { getActiveReservationForSku } from "@/lib/ops/mutations";
import { getOpsStore } from "@/lib/ops/store";
import { statusLabelRu } from "@/lib/ops/status-map";
import { PriceUpdateForm } from "@/components/ops/PriceUpdateForm";
import { ReleaseReservationButton } from "@/components/ops/ReleaseReservationButton";
import { ProductAiPanel } from "@/components/ai/ProductAiPanel";
import { getAiFlagsForClient } from "@/lib/ai/public-flags";
import { similarProducts } from "@/lib/ai/recommend/similar-products";
import { ContextualSops } from "@/components/scale/ContextualSops";
import { avitoChannelStatusRu } from "@/lib/i18n/ru-ui";

export default async function CatalogSkuPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku: raw } = await params;
  const sku = decodeURIComponent(raw);

  const session = await getSession();
  const canEditPrice =
    !!session && roleHasPermission(session.role, "pricing:edit");

  const s = getOpsStore();
  const p = getCatalogProductOrStub(sku);
  const eff = computeEffectivePrice(s.prices[sku], p, s.promotions);
  const inv = s.inventory[sku];
  const res = getActiveReservationForSku(s, sku);
  const avito = s.avitoBySku[sku];
  const priceRow = s.prices[sku];
  const aiFlags = getAiFlagsForClient();
  const similar = similarProducts(sku, 5);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/app/catalog" className="text-sm text-[var(--muted)] hover:underline">
        ← Каталог
      </Link>
      <div>
        <h1 className="font-display text-3xl">{p.name}</h1>
        <p className="font-mono text-sm text-[var(--muted)]">{sku}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2 text-sm">
          <h2 className="font-medium">Цена</h2>
          <p>Базовая цена: {formatRub(priceRow?.masterPrice ?? p.price ?? 0)}</p>
          <p>
            Эффективно: <strong>{formatRub(eff.effective)}</strong>
          </p>
          {eff.activePromoName && (
            <p className="text-xs text-[var(--muted)]">Промо: {eff.activePromoName}</p>
          )}
          <p className="text-xs text-[var(--muted)]">
            Обновлено: {priceRow?.lastUpdated} · {priceRow?.updatedBy} ·{" "}
            {priceRow?.source}
          </p>
          <PriceUpdateForm
            sku={sku}
            current={priceRow?.masterPrice ?? p.price ?? 0}
            canEdit={canEditPrice}
          />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <h2 className="font-medium">Наличие и резерв</h2>
          {inv && (
            <>
              <p className="mt-2">Статус: {statusLabelRu(inv.systemStatus)}</p>
              <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
                {inv.locations.map((l) => (
                  <li key={l.locationId}>
                    {l.locationName}: {l.qty} шт.
                  </li>
                ))}
              </ul>
            </>
          )}
          {res ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="font-medium text-amber-900">Активный резерв</p>
              <p className="text-xs">
                {res.clientName} до {new Date(res.validUntil).toLocaleString("ru-RU")}
              </p>
              {session?.role === "STOCK" || session?.role === "ADMIN" ? (
                <div className="mt-2">
                  <ReleaseReservationButton id={res.id} />
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-[var(--muted)]">Резерва нет</p>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <h2 className="font-medium">Готовность к Авито</h2>
        {avito ? (
          <ul className="mt-2 space-y-1">
            {avito.checklist.map((c) => (
              <li key={c.label}>
                {c.ok ? "+" : "−"} {c.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--muted)]">Нет данных</p>
        )}
        <p className="mt-2 text-xs text-[var(--muted)]">
          Статус канала: {avito ? avitoChannelStatusRu(avito.channelStatus) : "—"}
        </p>
        <p className="mt-3 text-xs">
          <Link href="/app/channels/avito" className="underline">
            Все каналы: публикации и маршруты
          </Link>
        </p>
      </div>
      <ContextualSops surface="product" />
      <ProductAiPanel sku={sku} flags={aiFlags} similar={similar} />
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <h2 className="font-medium">История цен</h2>
        <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs">
          {(priceRow?.history ?? []).map((h) => (
            <li key={h.id}>
              {h.at} · {h.by}: {h.field} {h.from} → {h.to}
            </li>
          ))}
        </ul>
      </div>
      <Link href={`/app/stock/${encodeURIComponent(sku)}`} className="text-sm underline">
        Операции склада
      </Link>
    </div>
  );
}
