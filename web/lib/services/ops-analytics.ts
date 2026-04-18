import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { computeEffectivePrice } from "@/lib/ops/pricing-engine";
import { getActiveReservationForSku } from "@/lib/ops/mutations";
import { getOpsStore } from "@/lib/ops/store";
import type { InventorySystemStatus } from "@/lib/ops/types";

export type OpsAlert = {
  id: string;
  severity: "warn" | "critical";
  title: string;
  detail: string;
  href?: string;
};

const LOW_STOCK_THRESHOLD = 2;

export function buildOperationalAlerts(): OpsAlert[] {
  const s = getOpsStore();
  const alerts: OpsAlert[] = [];
  for (const sku of Object.keys(s.inventory)) {
    const inv = s.inventory[sku];
    const total = inv.locations.reduce((a, l) => a + l.qty, 0);
    const res = getActiveReservationForSku(s, sku);
    if (res) {
      const until = new Date(res.validUntil);
      const hours = (until.getTime() - Date.now()) / 36e5;
      if (hours < 48 && hours > 0) {
        alerts.push({
          id: `stale-res-${sku}`,
          severity: "warn",
          title: "Резерв скоро истечёт",
          detail: `${sku} · ${res.clientName} · до ${until.toLocaleString("ru-RU")}`,
          href: `/app/catalog/${encodeURIComponent(sku)}`,
        });
      }
    }
    if (
      inv.systemStatus === "in_stock" &&
      total <= LOW_STOCK_THRESHOLD &&
      total > 0
    ) {
      alerts.push({
        id: `low-${sku}`,
        severity: "warn",
        title: "Низкий остаток",
        detail: `${sku}: ${total} шт. по локациям`,
        href: `/app/stock/${encodeURIComponent(sku)}`,
      });
    }
    const product = CATALOG_BY_SKU[sku];
    if (product) {
      const pe = computeEffectivePrice(s.prices[sku], product, s.promotions);
      const master = s.prices[sku]?.masterPrice ?? product.price ?? 0;
      if (
        !pe.activePromoName &&
        master > 0 &&
        Math.abs(pe.effective - master) / master > 0.25
      ) {
        alerts.push({
          id: `price-${sku}`,
          severity: "warn",
          title: "Проверить цену",
          detail: `${sku}: база ${master}, эффективно ${pe.effective}`,
          href: `/app/pricing`,
        });
      }
    }
  }
  const staleDeals = 2;
  if (staleDeals) {
    alerts.push({
      id: "stuck-deals",
      severity: "warn",
      title: "Зависшие сделки",
      detail: "2 сделки без контакта >7 дней (демо-метрика)",
      href: "/app/analytics",
    });
  }
  return alerts.slice(0, 12);
}

export function inventoryAnalyticsSummary() {
  const s = getOpsStore();
  const dist: Record<InventorySystemStatus, number> = {
    in_stock: 0,
    reserved: 0,
    made_to_order: 0,
    out: 0,
    production: 0,
    awaiting_stone: 0,
    sold_archive: 0,
  };
  for (const inv of Object.values(s.inventory)) {
    dist[inv.systemStatus]++;
  }
  const reservedSkus = s.reservations.filter((r) => r.status === "active").length;
  return { dist, reservedSkus, logCount: s.stockLog.length };
}

export function marketingStatic() {
  return {
    leadsBySource: [
      { label: "Яндекс.Директ", value: 34 },
      { label: "Инстаграм", value: 28 },
      { label: "Авито", value: 19 },
      { label: "Сарафан", value: 12 },
    ],
    conversionBySource: [
      { label: "Авито", rate: 0.31 },
      { label: "Директ", rate: 0.26 },
      { label: "Инстаграм", rate: 0.22 },
    ],
    costSummaryRub: 128_000,
  };
}
