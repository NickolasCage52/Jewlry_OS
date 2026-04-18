import { createId } from "@/lib/ops/id";
import type {
  ActivityEvent,
  InventorySystemStatus,
  OpsState,
  Promotion,
  Reservation,
} from "@/lib/ops/types";
import type { SessionUser } from "@/lib/types/session";

export function expireStaleReservations(s: OpsState) {
  const nowIso = new Date().toISOString();
  const now = Date.now();
  for (const r of s.reservations) {
    if (r.status !== "active") continue;
    if (Date.parse(r.validUntil) < now) {
      r.status = "expired";
      r.audit.push({
        at: nowIso,
        by: "Система",
        byUserId: "system",
        action: "Авто: истёк срок резерва",
      });
      pushActivity(s, {
        type: "reserve",
        message: `Резерв истёк · ${r.sku} · ${r.clientName}`,
        sku: r.sku,
        clientId: r.clientId,
      });
    }
  }
}

export function pushActivity(
  s: OpsState,
  partial: Omit<ActivityEvent, "id" | "at"> & { at?: string },
) {
  s.activity.unshift({
    id: createId("act"),
    at: partial.at ?? new Date().toISOString(),
    ...partial,
  });
  if (s.activity.length > 200) s.activity.pop();
}

export function getActiveReservationForSku(
  s: OpsState,
  sku: string,
): Reservation | undefined {
  return s.reservations.find((r) => r.sku === sku && r.status === "active");
}

export function setMasterPrice(
  s: OpsState,
  sku: string,
  next: number,
  user: SessionUser,
) {
  const row = s.prices[sku];
  if (!row) return { ok: false as const, error: "unknown_sku" };
  const prev = row.masterPrice;
  row.masterPrice = next;
  row.priceOverride = null;
  row.lastUpdated = new Date().toISOString();
  row.updatedBy = user.name;
  row.updatedByUserId = user.id;
  row.source = "manual";
  row.history.unshift({
    id: createId("ph"),
    sku,
    at: row.lastUpdated,
    by: user.name,
    byUserId: user.id,
    field: "masterPrice",
    from: String(prev),
    to: String(next),
    source: "manual",
  });
  pushActivity(s, {
    type: "price",
    message: "Цена " + sku + ": " + prev + " -> " + next,
    sku,
  });
  return { ok: true as const };
}

export function setInventoryStatus(
  s: OpsState,
  sku: string,
  next: InventorySystemStatus,
  user: SessionUser,
  detail: string,
) {
  const inv = s.inventory[sku];
  if (!inv) return { ok: false as const, error: "unknown_sku" };
  const prev = inv.systemStatus;
  inv.systemStatus = next;
  inv.updatedAt = new Date().toISOString();
  s.stockLog.unshift({
    id: createId("st"),
    sku,
    at: inv.updatedAt,
    by: user.name,
    byUserId: user.id,
    action: "status_change",
    detail,
    prevStatus: prev,
    nextStatus: next,
  });
  pushActivity(s, {
    type: "stock",
    message: `Склад ${sku}: статус обновлён`,
    sku,
  });
  return { ok: true as const };
}

export function createReservation(
  s: OpsState,
  args: {
    sku: string;
    clientId: string;
    clientName: string;
    validUntil: string;
    user: SessionUser;
  },
): { ok: true; id: string } | { ok: false; error: string } {
  expireStaleReservations(s);
  const existing = s.reservations.find(
    (r) => r.sku === args.sku && r.status === "active",
  );
  if (existing) {
    return {
      ok: false,
      error: `Уже зарезервировано для ${existing.clientName} до ${new Date(
        existing.validUntil,
      ).toLocaleString("ru-RU")}`,
    };
  }
  const id = createId("res");
  const at = new Date().toISOString();
  s.reservations.unshift({
    id,
    sku: args.sku,
    qty: 1,
    reservedByUserId: args.user.id,
    reservedByName: args.user.name,
    clientId: args.clientId,
    clientName: args.clientName,
    reservedAt: at,
    validUntil: args.validUntil,
    status: "active",
    audit: [
      {
        at,
        by: args.user.name,
        byUserId: args.user.id,
        action: "Создан резерв",
      },
    ],
  });
  const inv = s.inventory[args.sku];
  if (inv && inv.systemStatus === "in_stock") {
    inv.systemStatus = "reserved";
    inv.updatedAt = at;
  }
  pushActivity(s, {
    type: "reserve",
    message: `Резерв ${args.sku} · ${args.clientName}`,
    sku: args.sku,
    clientId: args.clientId,
  });
  return { ok: true, id };
}

export function releaseReservation(
  s: OpsState,
  reservationId: string,
  user: SessionUser,
) {
  const r = s.reservations.find((x) => x.id === reservationId);
  if (!r || r.status !== "active") return { ok: false as const, error: "not_found" };
  const at = new Date().toISOString();
  r.status = "released";
  r.audit.push({
    at,
    by: user.name,
    byUserId: user.id,
    action: "Резерв снят",
  });
  pushActivity(s, {
    type: "reserve",
    message: `Снят резерв ${r.sku} · ${r.clientName}`,
    sku: r.sku,
    clientId: r.clientId,
  });
  return { ok: true as const };
}

export function addPromotion(s: OpsState, p: Promotion) {
  s.promotions.unshift(p);
  pushActivity(s, {
    type: "promo",
    message: `Акция «${p.name}» · ${p.status}`,
  });
}

export function setCurrencyOverride(
  s: OpsState,
  rate: number,
  user: SessionUser,
) {
  const prev = s.currency.manualOverride ?? s.currency.rate;
  s.currency.manualOverride = rate;
  s.currency.rate = rate;
  s.currency.overrideBy = user.name;
  s.currency.overrideAt = new Date().toISOString();
  s.currency.overrideLog.unshift({
    at: s.currency.overrideAt,
    by: user.name,
    from: prev,
    to: rate,
  });
  pushActivity(s, {
    type: "currency",
    message: `Курс USD: ручной оверрайд ${prev} → ${rate}`,
  });
}

export function refreshCurrencyMock(s: OpsState) {
  const base = 92.5;
  const jitter = (Math.random() - 0.5) * 0.8;
  const next = Math.round((base + jitter) * 1000) / 1000;
  if (s.currency.manualOverride == null) {
    s.currency.rate = next;
  }
  s.currency.source = "mock_cbr_adapter";
  s.currency.updatedAt = new Date().toISOString();
  pushActivity(s, {
    type: "currency",
    message: `Обновление курса (stub): ${next}`,
  });
}
