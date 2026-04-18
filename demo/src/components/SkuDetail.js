import { openSlideOver } from "./ui/SlideOver.js";
import { getSkuDetail } from "../data/skuCatalog.js";
import { mediaItems } from "../data/products.js";
import { escapeHtml, formatRub } from "../util.js";
import { showToast } from "./toast.js";

function availabilityBlock(a) {
  const rows = [
    ["Витрина", a.showroom],
    ["Склад", a.warehouse],
    ["Резерв", a.reserved],
    ["В пути", a.inbound],
  ];
  return `
    <div class="sku-avail">
      <h4 class="sku-subtitle">Наличие</h4>
      <div class="sku-avail__grid">
        ${rows
          .map(
            ([k, v]) => `
          <div class="sku-avail__cell">
            <span class="sku-avail__k">${escapeHtml(k)}</span>
            <strong class="sku-avail__v">${v}</strong>
          </div>`,
          )
          .join("")}
      </div>
      ${a.madeToOrder ? `<p class="sku-hint">\u2726 Возможно изготовление под размер — срок уточняет производство.</p>` : ""}
    </div>`;
}

export function openSkuDetail(sku, { onOpenProduction } = {}) {
  const d = getSkuDetail(sku);
  if (!d) {
    showToast("Карточка товара не найдена", "error");
    return;
  }

  const related = mediaItems.filter((m) => m.sku === sku).slice(0, 12);
  const contentHtml = related.length
    ? related
        .map(
          (m) =>
            `<button type="button" class="sku-content-chip" data-media-id="${m.id}" style="--chip:${m.color}">\u2726 ${escapeHtml(m.name.slice(0, 42))}${m.name.length > 42 ? "…" : ""}</button>`,
        )
        .join("")
    : `<p class="sku-muted">Нет привязанных материалов в демо-наборе.</p>`;

  const priceHtml = d.price != null ? escapeHtml(formatRub(d.price)) : "—";

  const dealsHtml =
    d.recentDeals && d.recentDeals.length
      ? d.recentDeals
          .map(
            (x) => `
        <div class="sku-deal-row">
          <div><strong>${escapeHtml(x.client)}</strong><span class="sku-muted"> · ${escapeHtml(x.stage)}</span></div>
          <div class="sku-deal-meta">${escapeHtml(x.amount)} · ${escapeHtml(x.when)}</div>
        </div>`,
          )
          .join("")
      : `<p class="sku-muted">Нет недавних сделок по SKU в демо.</p>`;

  const logHtml = (d.changeLog || [])
    .map(
      (x) => `
    <div class="sku-log-row">
      <div class="sku-log-when">${escapeHtml(x.when)} · ${escapeHtml(x.who)}</div>
      <div>${escapeHtml(x.text)}</div>
    </div>`,
    )
    .join("");

  const body = `
    <div class="sku-detail">
      <div class="sku-detail__hero">
        <div class="sku-detail__swatch" style="background:linear-gradient(135deg,var(--gold-pale),var(--cream))"></div>
        <div>
          <p class="sku-eyebrow">${escapeHtml(d.collection || "Коллекция")}</p>
          <h3 class="sku-title">${escapeHtml(d.name)}</h3>
          <p class="sku-sku-line">SKU <code>${escapeHtml(d.sku)}</code> · <span class="sku-status-pill">${escapeHtml(d.statusLabel)}</span></p>
          <p class="sku-price-line">${priceHtml}</p>
        </div>
      </div>
      <div class="sku-spec-grid">
        <div><span class="sku-k">Металл</span><span class="sku-v">${escapeHtml(d.metal)}</span></div>
        <div><span class="sku-k">Вставка</span><span class="sku-v">${escapeHtml(d.stone)}</span></div>
        <div><span class="sku-k">Размер / тип</span><span class="sku-v">${escapeHtml(d.size)}</span></div>
        <div><span class="sku-k">Вес</span><span class="sku-v">${escapeHtml(d.weight)}</span></div>
      </div>
      ${availabilityBlock(d.availability)}
      <h4 class="sku-subtitle">Связанный контент</h4>
      <div class="sku-content-list">${contentHtml}</div>
      <h4 class="sku-subtitle">Последние сделки</h4>
      <div class="sku-deals">${dealsHtml}</div>
      <h4 class="sku-subtitle">История изменений</h4>
      <div class="sku-log">${logHtml}</div>
      <div class="sku-foot-actions">
        <button type="button" class="btn btn--primary" data-sku-open-content>\u2192 Открыть в контент-центре</button>
        ${typeof onOpenProduction === "function" ? `<button type="button" class="btn" data-sku-prod>Статус производства</button>` : ""}
      </div>
    </div>`;

  const { bodyEl, close } = openSlideOver({
    title: "Карточка товара",
    bodyHtml: body,
    wide: true,
  });

  bodyEl.querySelectorAll("[data-media-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast(`Материал #${btn.dataset.mediaId} — в контент-центре`, "info");
    });
  });
  bodyEl.querySelector("[data-sku-open-content]")?.addEventListener("click", () => {
    showToast("Перейдите в «Контент-центр» и введите артикул в поиске", "info");
  });
  bodyEl.querySelector("[data-sku-prod]")?.addEventListener("click", () => {
    onOpenProduction?.();
    close();
  });
}
