import Link from "next/link";
import { notFound } from "next/navigation";
import { roleHasPermission } from "@/lib/auth/access";
import { getSession } from "@/lib/auth/session";
import { MOCK_CLIENTS, clientKey } from "@/lib/mock/clients";
import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { formatRub } from "@/lib/format/money";
import { computeEffectivePrice } from "@/lib/ops/pricing-engine";
import { getActiveReservationForSku } from "@/lib/ops/mutations";
import { getOpsStore } from "@/lib/ops/store";
import { statusLabelRu } from "@/lib/ops/status-map";
import { ReserveSkuForm } from "@/components/ops/ReserveSkuForm";
import { ReleaseReservationButton } from "@/components/ops/ReleaseReservationButton";
import { SalesCopilotPanel } from "@/components/ai/SalesCopilotPanel";
import { getAiFlagsForClient } from "@/lib/ai/public-flags";
import { ContextualSops } from "@/components/scale/ContextualSops";
import { lifecycleService } from "@/lib/scale/services";
import { lifecycleStageRu } from "@/lib/i18n/ru-ui";

export default async function SalesClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = MOCK_CLIENTS.find((c) => String(c.id) === id);
  if (!client) notFound();
  const session = await getSession();
  const canRelease =
    !!session && roleHasPermission(session.role, "reservation:release");
  const s = getOpsStore();
  const sku = client.deal.sku;
  const product = CATALOG_BY_SKU[sku];
  const eff = product
    ? computeEffectivePrice(s.prices[sku], product, s.promotions)
    : null;
  const res = getActiveReservationForSku(s, sku);
  const inv = s.inventory[sku];
  const aiFlags = getAiFlagsForClient();
  const lc = lifecycleService.get(clientKey(client.id));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/app/sales" className="text-sm text-[var(--muted)] hover:underline">
        ← Клиенты
      </Link>
      <div>
        <h1 className="font-display text-3xl">{client.name}</h1>
        <p className="text-sm text-[var(--muted)]">
          {client.phone} · {client.email}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-medium">Сделка</h2>
          <p className="mt-2 text-sm">{client.deal.product}</p>
          <p className="font-mono text-xs text-[var(--muted)]">{sku}</p>
          <p className="mt-2 text-sm">
            Эффективная цена:{" "}
            <strong>{eff ? formatRub(eff.effective) : "—"}</strong>
            {eff?.activePromoName && (
              <span className="block text-xs text-[var(--muted)]">
                Акция: {eff.activePromoName}
              </span>
            )}
          </p>
          <p className="text-sm">Статус клиента: {client.status}</p>
          {inv && (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Склад: {statusLabelRu(inv.systemStatus)}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-medium">Резерв</h2>
          {res ? (
            <div className="mt-2 space-y-2 text-sm">
              <p>
                Зарезервировано за <strong>{res.clientName}</strong> до{" "}
                {new Date(res.validUntil).toLocaleString("ru-RU")}
              </p>
              {canRelease ? <ReleaseReservationButton id={res.id} /> : null}
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-[var(--muted)] mb-2">Нет активного резерва</p>
              <ReserveSkuForm
                sku={sku}
                clientId={clientKey(client.id)}
                clientName={client.name}
              />
            </div>
          )}
        </div>
      </div>
      {lc ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <h2 className="text-sm font-medium">Жизненный цикл и сопровождение</h2>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Состояние: {lifecycleStageRu(lc.lifecycle)} · заказов ~{lc.ordersApprox} · LTV{" "}
            {lc.lifetimeValueRub.toLocaleString("ru-RU")} ₽ · контакт{" "}
            {lc.lastContactDaysAgo} дн. назад
          </p>
          <p className="mt-2 text-xs">{lc.segmentNote}</p>
          <ul className="mt-2 list-inside list-disc text-xs text-[var(--muted)]">
            {lc.careTriggers.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs">
            <Link href="/app/lifecycle" className="underline">
              Таблица жизненного цикла
            </Link>
          </p>
        </div>
      ) : null}
      <ContextualSops surface="client_card" title="Регламенты для работы с клиентом" />
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">Следующий шаг</h2>
        {client.nextAction ? (
          <p className="mt-2 text-sm">
            {client.nextAction.type} — {client.nextAction.date}
          </p>
        ) : (
          <p className="text-sm text-[var(--muted)]">—</p>
        )}
        {client.notes && (
          <p className="mt-3 text-sm text-[var(--muted)]">Заметка: {client.notes}</p>
        )}
      </div>
      <SalesCopilotPanel clientId={id} flags={aiFlags} />
      <div className="flex gap-4 text-sm">
        <Link href={`/app/catalog/${encodeURIComponent(sku)}`} className="underline">
          Карточка товара
        </Link>
        <Link href="/app/faq" className="underline">
          ЧаВо
        </Link>
        <Link href="/app/search" className="underline">
          AI-поиск
        </Link>
      </div>
    </div>
  );
}
