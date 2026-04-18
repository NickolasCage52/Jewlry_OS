/** Системные статусы наличия (операционный слой). */
export type InventorySystemStatus =
  | "in_stock"
  | "reserved"
  | "made_to_order"
  | "out"
  | "production"
  | "awaiting_stone"
  | "sold_archive";

export type LocationKind = "showroom" | "warehouse" | "transit";

export type InventoryLocationRecord = {
  locationId: string;
  locationName: string;
  kind: LocationKind;
  qty: number;
  note?: string;
  updatedAt: string;
  updatedBy: string;
  source: string;
};

export type StockChangeLogEntry = {
  id: string;
  sku: string;
  at: string;
  by: string;
  byUserId: string;
  action: string;
  detail: string;
  prevStatus?: InventorySystemStatus;
  nextStatus?: InventorySystemStatus;
};

export type SkuInventoryState = {
  sku: string;
  systemStatus: InventorySystemStatus;
  availabilityNote?: string;
  locations: InventoryLocationRecord[];
  updatedAt: string;
};

export type PriceHistoryEntry = {
  id: string;
  sku: string;
  at: string;
  by: string;
  byUserId: string;
  field: string;
  from: string;
  to: string;
  source: string;
};

export type PriceState = {
  sku: string;
  masterPrice: number;
  priceOverride: number | null;
  lastUpdated: string;
  updatedBy: string;
  updatedByUserId: string;
  source: "seed" | "manual" | "import_stub" | "erp_stub";
  history: PriceHistoryEntry[];
};

export type PromoScopeType = "category" | "sku" | "collection";
export type PromoDiscountType = "fixed" | "percent" | "manual_override";
export type PromoStatus = "draft" | "active" | "ended";

export type Promotion = {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  scopeType: PromoScopeType;
  scopeValue: string;
  discountType: PromoDiscountType;
  value: number;
  status: PromoStatus;
  affectedCount: number;
  createdBy: string;
};

export type ReservationStatus = "active" | "released" | "expired" | "converted";

export type ReservationAuditRow = {
  at: string;
  by: string;
  byUserId: string;
  action: string;
};

export type Reservation = {
  id: string;
  sku: string;
  qty: number;
  reservedByUserId: string;
  reservedByName: string;
  clientId: string;
  clientName: string;
  reservedAt: string;
  validUntil: string;
  status: ReservationStatus;
  audit: ReservationAuditRow[];
};

export type Supplier = {
  id: string;
  name: string;
  type: "stones" | "findings" | "outsource" | "other";
  contact: string;
  notes: string;
  active: boolean;
};

export type StoneLineItem = {
  id: string;
  stoneType: string;
  shape: string;
  sizeLabel: string;
  carat: number;
  qty: number;
  currency: string;
  purchasePrice: number;
  supplierId: string;
  linkedCategory?: string;
  purchasedAt: string;
};

export type ProcurementLine = {
  id: string;
  label: string;
  qty: number;
  unitPriceForeign: number;
  currency: string;
};

export type ProcurementEntry = {
  id: string;
  supplierId: string;
  lines: ProcurementLine[];
  fxRate: number;
  rubTotal: number;
  comment: string;
  createdAt: string;
  createdBy: string;
  createdByUserId: string;
};

export type CurrencyState = {
  code: string;
  rate: number;
  source: string;
  updatedAt: string;
  manualOverride: number | null;
  overrideBy?: string;
  overrideAt?: string;
  overrideLog: { at: string; by: string; from: number; to: number }[];
};

export type ActivityEvent = {
  id: string;
  at: string;
  type:
    | "price"
    | "stock"
    | "reserve"
    | "procurement"
    | "currency"
    | "promo"
    | "channel";
  message: string;
  sku?: string;
  clientId?: string;
};

export type AvitoMissing =
  | "photos"
  | "price"
  | "description"
  | "stock_status"
  | "promo_sync";

export type AvitoReadiness = {
  sku: string;
  eligible: boolean;
  readyToPublish: boolean;
  missing: AvitoMissing[];
  channelStatus: "off" | "ready" | "live_stub" | "blocked";
  priceVisible: boolean;
  checklist: { label: string; ok: boolean }[];
};

export type OpsState = {
  prices: Record<string, PriceState>;
  promotions: Promotion[];
  inventory: Record<string, SkuInventoryState>;
  reservations: Reservation[];
  stockLog: StockChangeLogEntry[];
  suppliers: Supplier[];
  procurementEntries: ProcurementEntry[];
  stones: StoneLineItem[];
  currency: CurrencyState;
  activity: ActivityEvent[];
  avitoBySku: Record<string, AvitoReadiness>;
};
