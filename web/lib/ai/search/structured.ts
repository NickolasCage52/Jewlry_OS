import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { FAQ_ITEMS } from "@/lib/mock/faq";
import { MEDIA_ASSETS } from "@/lib/mock/media-assets";
import { MOCK_CLIENTS } from "@/lib/mock/clients";
import { getOpsStore } from "@/lib/ops/store";
import { statusLabelRu } from "@/lib/ops/status-map";
import { computeEffectivePrice } from "@/lib/ops/pricing-engine";
import { getActiveReservationForSku } from "@/lib/ops/mutations";

export type SearchHitProduct = {
  kind: "product";
  sku: string;
  name: string;
  stone: string;
  metal: string;
  status: string;
  effectivePrice: number;
  snippet: string;
};

export type SearchHitMedia = {
  kind: "media";
  id: number;
  name: string;
  sku: string;
  channels: string;
  snippet: string;
};

export type SearchHitFaq = {
  kind: "faq";
  id: string;
  q: string;
  snippet: string;
};

export type SearchHitClient = {
  kind: "client";
  id: number;
  name: string;
  snippet: string;
};

export type StructuredSearchResult = {
  products: SearchHitProduct[];
  media: SearchHitMedia[];
  faq: SearchHitFaq[];
  clients: SearchHitClient[];
};

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function includesAll(hay: string, needles: string[]): boolean {
  const h = norm(hay);
  return needles.every((n) => n.length > 0 && h.includes(norm(n)));
}

export function runStructuredSearch(rawQuery: string): StructuredSearchResult {
  if (rawQuery.trim().length < 2) {
    return { products: [], media: [], faq: [], clients: [] };
  }
  const q = norm(rawQuery);
  const tokens = q.split(" ").filter((t) => t.length > 1).slice(0, 8);
  const s = getOpsStore();

  const products: SearchHitProduct[] = [];
  for (const p of Object.values(CATALOG_BY_SKU)) {
    const blob = [p.name, p.sku, p.stone, p.metal, p.collection, p.statusLabel].join(
      " ",
    );
    if (
      tokens.length === 0 ||
      includesAll(blob, tokens) ||
      tokens.some((t) => norm(blob).includes(t))
    ) {
      const inv = s.inventory[p.sku];
      const st = inv ? statusLabelRu(inv.systemStatus) : p.statusLabel;
      const eff = computeEffectivePrice(s.prices[p.sku], p, s.promotions).effective;
      const res = getActiveReservationForSku(s, p.sku);
      products.push({
        kind: "product",
        sku: p.sku,
        name: p.name,
        stone: p.stone,
        metal: p.metal,
        status: st + (res ? ` · резерв: ${res.clientName}` : ""),
        effectivePrice: eff,
        snippet: `${p.sku} · ${p.stone} · ${st}`,
      });
    }
  }

  const media: SearchHitMedia[] = [];
  for (const m of MEDIA_ASSETS) {
    const blob = [m.name, m.sku, m.stone, m.metal, m.category, ...m.channel, ...(m.tags ?? [])].join(" ");
    if (tokens.length === 0 || tokens.some((t) => norm(blob).includes(t))) {
      media.push({
        kind: "media",
        id: m.id,
        name: m.name,
        sku: m.sku,
        channels: m.channel.join(", "),
        snippet: `${m.type} · ${m.sku}`,
      });
    }
  }

  const faq: SearchHitFaq[] = [];
  for (const f of FAQ_ITEMS) {
    const blob = `${f.q} ${f.a} ${f.cat}`;
    if (tokens.length === 0 || tokens.some((t) => norm(blob).includes(t))) {
      faq.push({
        kind: "faq",
        id: f.id,
        q: f.q,
        snippet: f.a.slice(0, 160) + (f.a.length > 160 ? "…" : ""),
      });
    }
  }

  const clients: SearchHitClient[] = [];
  for (const c of MOCK_CLIENTS) {
    const blob = [
      c.name,
      c.deal.product,
      c.deal.sku,
      c.status,
      c.notes ?? "",
    ].join(" ");
    if (tokens.length === 0 || tokens.some((t) => norm(blob).includes(t))) {
      clients.push({
        kind: "client",
        id: c.id,
        name: c.name,
        snippet: `${c.status} · ${c.deal.sku} · ${c.deal.product}`,
      });
    }
  }

  return {
    products: products.slice(0, 24),
    media: media.slice(0, 16),
    faq: faq.slice(0, 12),
    clients: clients.slice(0, 8),
  };
}
