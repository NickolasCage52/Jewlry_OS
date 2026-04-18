import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { createId } from "@/lib/ops/id";
import { statusFromCatalogLabel } from "@/lib/ops/status-map";
import type {
  AvitoMissing,
  AvitoReadiness,
  OpsState,
  PriceState,
  SkuInventoryState,
} from "@/lib/ops/types";

const SEED_TIME = "2026-04-17T12:00:00.000Z";

function buildAvitoRow(sku: string): AvitoReadiness {
  const p = CATALOG_BY_SKU[sku];
  const hasStock =
    p.availability.showroom + p.availability.warehouse > 0 ||
    p.availability.madeToOrder;
  const missing: AvitoMissing[] = [];
  if (!p.price) missing.push("price");
  if (!hasStock) missing.push("stock_status");
  if (["ERR-1923", "PND-0892"].includes(sku)) missing.push("photos");
  if (sku === "RNG-3001") missing.push("description");
  const checklist = [
    { label: "Фото (мин. 3 ракурса)", ok: !missing.includes("photos") },
    { label: "Цена и промо", ok: !missing.includes("price") },
    { label: "Описание карточки", ok: !missing.includes("description") },
    { label: "Статус наличия / под заказ", ok: !missing.includes("stock_status") },
    { label: "Синхронизация акции", ok: !missing.includes("promo_sync") },
  ];
  return {
    sku,
    eligible: true,
    readyToPublish: missing.length === 0,
    missing,
    channelStatus: missing.length ? "blocked" : "ready",
    priceVisible: true,
    checklist,
  };
}

function buildInitial(): OpsState {
  const prices: Record<string, PriceState> = {};
  const inventory: Record<string, SkuInventoryState> = {};
  const avitoBySku: Record<string, AvitoReadiness> = {};

  for (const sku of Object.keys(CATALOG_BY_SKU)) {
    const p = CATALOG_BY_SKU[sku];
    const price = p.price ?? 0;
    prices[sku] = {
      sku,
      masterPrice: price,
      priceOverride: null,
      lastUpdated: SEED_TIME,
      updatedBy: "Система",
      updatedByUserId: "system",
      source: "seed",
      history: [],
    };
    inventory[sku] = {
      sku,
      systemStatus: statusFromCatalogLabel(p.statusLabel),
      locations: [
        {
          locationId: "loc-show-1",
          locationName: "Шоурум Тверская",
          kind: "showroom",
          qty: p.availability.showroom,
          updatedAt: SEED_TIME,
          updatedBy: "Система",
          source: "seed",
        },
        {
          locationId: "loc-wh-1",
          locationName: "Склад А",
          kind: "warehouse",
          qty: p.availability.warehouse,
          updatedAt: SEED_TIME,
          updatedBy: "Система",
          source: "seed",
        },
      ],
      updatedAt: SEED_TIME,
    };
    avitoBySku[sku] = buildAvitoRow(sku);
  }

  return {
    prices,
    promotions: [
      {
        id: "promo-royal-8",
        name: "Royal Blue −8%",
        startAt: "2026-04-01T00:00:00.000Z",
        endAt: "2026-06-30T23:59:59.000Z",
        scopeType: "collection",
        scopeValue: "Royal Blue",
        discountType: "percent",
        value: 8,
        status: "active",
        affectedCount: Object.values(CATALOG_BY_SKU).filter(
          (x) => x.collection === "Royal Blue",
        ).length,
        createdBy: "Полина Волкова",
      },
    ],
    inventory,
    reservations: [
      {
        id: "res-seed-brc",
        sku: "BRC-5512",
        qty: 1,
        reservedByUserId: "u-sales",
        reservedByName: "М. Петрова",
        clientId: "c3",
        clientName: "Елена Власова",
        reservedAt: "2026-04-14T10:00:00.000Z",
        validUntil: "2026-04-22T18:00:00.000Z",
        status: "active",
        audit: [
          {
            at: "2026-04-14T10:00:00.000Z",
            by: "М. Петрова",
            byUserId: "u-sales",
            action: "Создан резерв",
          },
        ],
      },
    ],
    stockLog: [],
    suppliers: [
      {
        id: "sup-gem",
        name: "GemTrade LLC",
        type: "stones",
        contact: "buyer@gemtrade.demo",
        notes: "Сапфиры, рубины",
        active: true,
      },
      {
        id: "sup-metal",
        name: "МеталлПро",
        type: "findings",
        contact: "sales@metalpro.demo",
        notes: "Слитки, лигатуры",
        active: true,
      },
    ],
    procurementEntries: [
      {
        id: "proc-apr",
        supplierId: "sup-gem",
        lines: [
          {
            id: "ln-1",
            label: "Сапфир овал 1.1 ct",
            qty: 4,
            unitPriceForeign: 420,
            currency: "USD",
          },
        ],
        fxRate: 92.5,
        rubTotal: Math.round(4 * 420 * 92.5),
        comment: "Партия апрель",
        createdAt: "2026-04-10T14:00:00.000Z",
        createdBy: "Марина Лебедева",
        createdByUserId: "u-supply",
      },
    ],
    stones: [
      {
        id: "stone-apr-1",
        stoneType: "Сапфир",
        shape: "Овал",
        sizeLabel: "8×6 mm",
        carat: 1.1,
        qty: 4,
        currency: "USD",
        purchasePrice: 420,
        supplierId: "sup-gem",
        linkedCategory: "Кольца",
        purchasedAt: "2026-04-10",
      },
    ],
    currency: {
      code: "USD",
      rate: 92.5,
      source: "mock_cbr_adapter",
      updatedAt: "2026-04-17T09:00:00.000Z",
      manualOverride: null,
      overrideLog: [],
    },
    activity: [
      {
        id: createId("act"),
        at: SEED_TIME,
        type: "promo",
        message: "Акция Royal Blue −8% активна до30.06",
      },
      {
        id: createId("act"),
        at: "2026-04-14T10:00:00.000Z",
        type: "reserve",
        message: "Резерв BRC-5512 · Елена Власова",
        sku: "BRC-5512",
        clientId: "c3",
      },
    ],
    avitoBySku,
  };
}

declare global {
  var __jbosOpsStore: OpsState | undefined;
}

export function getOpsStore(): OpsState {
  if (!globalThis.__jbosOpsStore) {
    globalThis.__jbosOpsStore = buildInitial();
  }
  return globalThis.__jbosOpsStore;
}
