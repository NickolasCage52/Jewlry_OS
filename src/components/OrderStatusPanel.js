import { openSlideOver } from "./ui/SlideOver.js";
import { getProductionOrder } from "../data/productionOrders.js";
import { escapeHtml } from "../util.js";
import { showToast } from "./toast.js";

export function openOrderStatusPanel(orderId) {
  const o = getProductionOrder(orderId);
  if (!o) {
    showToast("Заказ не найден", "error");
    return;
  }

  const comments = o.comments
    .map(
      (c) => `
 <div class="order-comment">
      <div class="order-comment__meta">${escapeHtml(c.when)} · ${escapeHtml(c.who)}</div>
      <div>${escapeHtml(c.text)}</div>
    </div>`,
    )
    .join("");

  const body = `
    <div class="order-status">
      <div class="order-status__head">
        <div>
          <p class="order-eyebrow">Производство / операции</p>
          <h3 class="order-title">${escapeHtml(o.orderLabel)}</h3>
          <p class="order-meta">SKU <code>${escapeHtml(o.sku)}</code> · Заказ <strong>${escapeHtml(o.id)}</strong></p>
        </div>
        <div class="order-badges">
          <span class="order-pill order-pill--stage">${escapeHtml(o.stage)}</span>
          <span class="order-pill">${escapeHtml(o.status)}</span>
        </div>
      </div>
      <div class="order-grid">
        <div class="order-cell">
          <span class="order-k">Ответственный</span>
          <span class="order-v">${escapeHtml(o.owner)}</span>
        </div>
        <div class="order-cell">
          <span class="order-k">Срок</span>
          <span class="order-v">${escapeHtml(o.due)}</span>
        </div>
        <div class="order-cell">
          <span class="order-k">Готовность</span>
          <span class="order-v">${escapeHtml(o.readiness)}</span>
        </div>
      </div>
      <div class="order-progress">
        <div class="order-progress__track"><div class="order-progress__fill" style="width:${escapeHtml(o.readiness)}"></div></div>
      </div>
      <h4 class="sku-subtitle">Комментарии</h4>
      <div class="order-comments">${comments}</div>
    </div>`;

  openSlideOver({ title: "Статус заказа", bodyHtml: body, wide: true });
}
