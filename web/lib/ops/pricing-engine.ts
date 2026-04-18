import type { PriceState, Promotion } from "@/lib/ops/types";
import type { CatalogProduct } from "@/lib/types/catalog";

function promoAppliesToSku(
  p: Promotion,
  product: CatalogProduct,
  now: Date,
): boolean {
  if (p.status !== "active") return false;
  const t = now.getTime();
  if (t < Date.parse(p.startAt) || t > Date.parse(p.endAt)) return false;
  if (p.scopeType === "sku") return p.scopeValue === product.sku;
  if (p.scopeType === "collection")
    return product.collection === p.scopeValue;
  if (p.scopeType === "category") {
    const needle = p.scopeValue.toLowerCase();
    return (
      product.metal.toLowerCase().includes(needle) ||
      product.stone.toLowerCase().includes(needle)
    );
  }
  return false;
}

export type EffectivePriceResult = {
  effective: number;
  base: number;
  override: number | null;
  promoDeduction: number;
  activePromoName: string | null;
};

export function computeEffectivePrice(
  priceRow: PriceState | undefined,
  product: CatalogProduct,
  promotions: Promotion[],
  now = new Date(),
): EffectivePriceResult {
  const base =
    priceRow?.priceOverride ?? priceRow?.masterPrice ?? product.price ?? 0;
  let effective = base;
  let promoDeduction = 0;
  let activePromoName: string | null = null;
  for (const p of promotions) {
    if (!promoAppliesToSku(p, product, now)) continue;
    activePromoName = p.name;
    if (p.discountType === "percent") {
      const e = Math.round(base * (1 - p.value / 100));
      promoDeduction = base - e;
      effective = e;
    } else if (p.discountType === "fixed") {
      effective = Math.max(0, base - p.value);
      promoDeduction = base - effective;
    } else {
      effective = Math.max(0, p.value);
      promoDeduction = base - effective;
    }
  }
  return {
    effective,
    base: priceRow?.masterPrice ?? product.price ?? 0,
    override: priceRow?.priceOverride ?? null,
    promoDeduction,
    activePromoName,
  };
}
