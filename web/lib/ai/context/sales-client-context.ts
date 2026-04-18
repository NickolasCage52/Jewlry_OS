import { MOCK_CLIENTS } from "@/lib/mock/clients";
import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { FAQ_ITEMS } from "@/lib/mock/faq";
import { computeEffectivePrice } from "@/lib/ops/pricing-engine";
import { getActiveReservationForSku } from "@/lib/ops/mutations";
import { getOpsStore } from "@/lib/ops/store";
import { statusLabelRu } from "@/lib/ops/status-map";
import { similarProducts } from "@/lib/ai/recommend/similar-products";

export function buildSalesClientContext(clientId: string): string {
  const client = MOCK_CLIENTS.find((c) => String(c.id) === clientId);
  if (!client) return JSON.stringify({ error: "client_not_found" });
  const s = getOpsStore();
  const sku = client.deal.sku;
  const p = CATALOG_BY_SKU[sku];
  const eff = p
    ? computeEffectivePrice(s.prices[sku], p, s.promotions)
    : null;
  const inv = s.inventory[sku];
  const res = getActiveReservationForSku(s, sku);
  const similar = similarProducts(sku, 4);
  const faqHint = FAQ_ITEMS.filter(
    (f) =>
      f.q.toLowerCase().includes("срок") ||
      f.q.toLowerCase().includes("размер") ||
      f.q.toLowerCase().includes("доставк"),
  ).slice(0, 3);

  return JSON.stringify(
    {
      client: {
        name: client.name,
        status: client.status,
        phone: client.phone,
        email: client.email,
        notes: client.notes,
        nextAction: client.nextAction,
      },
      deal: client.deal,
      pricing: eff
        ? {
            effective: eff.effective,
            promo: eff.activePromoName,
          }
        : null,
      inventory: inv
        ? {
            status: statusLabelRu(inv.systemStatus),
            locations: inv.locations.map((l) => ({
              name: l.locationName,
              qty: l.qty,
            })),
          }
        : null,
      reservation: res
        ? {
            clientName: res.clientName,
            validUntil: res.validUntil,
          }
        : null,
      similarSkus: similar,
      faqRefs: faqHint.map((f) => ({ id: f.id, q: f.q })),
    },
    null,
    2,
  );
}
