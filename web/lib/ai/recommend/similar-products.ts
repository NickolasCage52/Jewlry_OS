import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { getOpsStore } from "@/lib/ops/store";
import { statusLabelRu } from "@/lib/ops/status-map";
import { computeEffectivePrice } from "@/lib/ops/pricing-engine";

export type SimilarRow = {
  sku: string;
  name: string;
  reason: string;
  effectivePrice: number;
  status: string;
};

/** Лёгкие рекомендации без ML: категория по металлу/камню/коллекции и близкий ценовой коридор. */
export function similarProducts(sku: string, limit = 5): SimilarRow[] {
  const base = CATALOG_BY_SKU[sku];
  if (!base) return [];
  const s = getOpsStore();
  const basePrice =
    computeEffectivePrice(s.prices[sku], base, s.promotions).effective || 0;
  const band = basePrice > 0 ? basePrice * 0.35 : 50000;

  const scored = Object.values(CATALOG_BY_SKU)
    .filter((p) => p.sku !== sku)
    .map((p) => {
      let score = 0;
      const reasons: string[] = [];
      if (p.collection === base.collection) {
        score += 3;
        reasons.push("та же коллекция");
      }
      if (p.stone === base.stone) {
        score += 2;
        reasons.push("тот же камень");
      } else if (
        normStone(p.stone) === normStone(base.stone) ||
        p.stone.split(" ")[0] === base.stone.split(" ")[0]
      ) {
        score += 1;
        reasons.push("близкая группа камней");
      }
      if (p.metal === base.metal) {
        score += 1;
        reasons.push("тот же металл");
      }
      const eff = computeEffectivePrice(s.prices[p.sku], p, s.promotions).effective;
      if (basePrice > 0 && Math.abs(eff - basePrice) <= band) {
        score += 1;
        reasons.push("похожий ценовой уровень");
      }
      const inv = s.inventory[p.sku];
      const st = inv ? statusLabelRu(inv.systemStatus) : p.statusLabel;
      return {
        sku: p.sku,
        name: p.name,
        reason: reasons.join("; ") || "из каталога",
        score,
        effectivePrice: eff,
        status: st,
      };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(
    ({ sku, name, reason, effectivePrice, status }) => ({
      sku,
      name,
      reason,
      effectivePrice,
      status,
    }),
  );
}

function normStone(s: string): string {
  return s.toLowerCase().replace(/[^a-zа-яё0-9]/gi, "");
}
