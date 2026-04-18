"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { roleHasPermission } from "@/lib/auth/access";
import { createId } from "@/lib/ops/id";
import {
  addPromotion,
  createReservation,
  refreshCurrencyMock,
  releaseReservation,
  setCurrencyOverride,
  setInventoryStatus,
  setMasterPrice,
} from "@/lib/ops/mutations";
import { getOpsStore } from "@/lib/ops/store";
import type { InventorySystemStatus, Promotion } from "@/lib/ops/types";
import type { PermissionCode } from "@/lib/types/session";

async function requirePerm(p: PermissionCode) {
  const session = await getSession();
  if (!session) throw new Error("unauthorized");
  if (!roleHasPermission(session.role, p)) throw new Error("forbidden");
  return session;
}

function rev() {
  revalidatePath("/app", "layout");
}

export async function actionSetMasterPrice(
  sku: string,
  nextPrice: number,
  confirmed: boolean,
) {
  if (!confirmed) return { ok: false as const, error: "not_confirmed" };
  const user = await requirePerm("pricing:edit");
  if (nextPrice < 0) return { ok: false as const, error: "invalid" };
  const s = getOpsStore();
  const r = setMasterPrice(s, sku, Math.round(nextPrice), user);
  rev();
  return r;
}

export async function actionSetStockStatus(
  sku: string,
  status: InventorySystemStatus,
  detail: string,
) {
  const user = await requirePerm("inventory:adjust");
  const s = getOpsStore();
  const r = setInventoryStatus(s, sku, status, user, detail);
  rev();
  return r;
}

export async function actionCreateReservation(
  sku: string,
  clientId: string,
  clientName: string,
  validUntilIso: string,
) {
  const user = await requirePerm("reservation:create");
  const s = getOpsStore();
  const r = createReservation(s, {
    sku,
    clientId,
    clientName,
    validUntil: validUntilIso,
    user,
  });
  rev();
  return r;
}

export async function actionReleaseReservation(reservationId: string) {
  const user = await requirePerm("reservation:release");
  const s = getOpsStore();
  const r = releaseReservation(s, reservationId, user);
  rev();
  return r;
}

export async function actionAddPromotion(input: {
  name: string;
  scopeType: Promotion["scopeType"];
  scopeValue: string;
  discountType: Promotion["discountType"];
  value: number;
  startAt: string;
  endAt: string;
}) {
  const user = await requirePerm("promo:manage");
  const s = getOpsStore();
  const affected =
    input.scopeType === "sku"
      ? 1
      : Object.values(s.inventory).filter(() => true).length;
  const p: Promotion = {
    id: createId("promo"),
    name: input.name,
    startAt: input.startAt,
    endAt: input.endAt,
    scopeType: input.scopeType,
    scopeValue: input.scopeValue,
    discountType: input.discountType,
    value: input.value,
    status: "active",
    affectedCount: Math.min(affected, 50),
    createdBy: user.name,
  };
  addPromotion(s, p);
  rev();
  return { ok: true as const };
}

export async function actionCurrencyOverride(rate: number) {
  const user = await requirePerm("procurement:edit");
  const s = getOpsStore();
  setCurrencyOverride(s, rate, user);
  rev();
  return { ok: true as const };
}

export async function actionRefreshCurrency() {
  await requirePerm("procurement:view");
  const s = getOpsStore();
  refreshCurrencyMock(s);
  rev();
  return { ok: true as const };
}
