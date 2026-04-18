import { getAvatarColor, formatRub, escapeHtml, initials } from "../../util.js";
import { stockBadgeClass } from "../../components/ui/stockBadge.js";
import { DEAL_STATUSES, dealStatusBadgeClass } from "../../components/ui/dealStatus.js";
import { openModal } from "../../components/ui/Modal.js";
import { mountAIAssistant } from "./AIAssistant.js";
import { mediaItems } from "../../data/products.js";
import { openSkuDetail } from "../../components/SkuDetail.js";
import { openOrderStatusPanel } from "../../components/OrderStatusPanel.js";
import { openFAQPanel } from "../../components/FAQPanel.js";
import { showToast } from "../../components/toast.js";

const NOTES_PREFIX = "jewelry-os-notes-";

function timelineIcon(type) {
  const m = { call: "\u260E", message: "\u2709", visit: "\u2316", deal: "\u2713", status: "\u27F3", lead: "+" };
  return m[type] || "\u2022";
}

function openSkuForClient(client, sku) {
  openSkuDetail(sku, {
    onOpenProduction: client.deal?.productionOrderId ? () => openOrderStatusPanel(client.deal.productionOrderId) : undefined,
  });
}

export function mountClientCard(container, client, hooks) {
  const storageKey = NOTES_PREFIX + client.id;
  let tab = "deal";
  let notes = localStorage.getItem(storageKey) || "";

  const deal = client.deal;
  const avatarBg = getAvatarColor(client.name);
  const ini = initials(client.name);

  function render() {
    const nextStrip =
      client.nextAction != null
        ? `<div class="client-card__next-strip">
            <div>
              <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted);margin-bottom:4px">Следующий шаг</div>
              <strong>${escapeHtml(client.nextAction.type)}</strong>
              <span style="color:var(--muted);font-size:0.9rem"> · ${escapeHtml(client.nextAction.date)}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              <button type="button" class="btn btn--primary" data-done-next>Выполнено</button>
              <button type="button" class="btn" data-snooze>Напомнить позже</button>
            </div>
          </div>`
        : "";

    container.innerHTML = `
      <div class="client-card" data-client-card>
        <div class="client-card__header">
          <div class="client-card__hero">
            <div class="client-card__avatar-lg" style="background:${avatarBg}">${escapeHtml(ini)}</div>
            <div class="client-card__contacts">
              <h2>${escapeHtml(client.name)}</h2>
              <p>${escapeHtml(client.phone)}</p>
              <p>${escapeHtml(client.email)}</p>
            </div>
          </div>
          <div class="client-card__actions">
            <button type="button" class="btn btn--primary" data-act-call>Позвонить</button>
            <button type="button" class="btn" data-act-write>Написать</button>
            <button type="button" class="btn" data-act-task>Задача</button>
            <button type="button" class="btn btn--ghost" data-open-faq>FAQ</button>
            <div class="client-card__status-wrap">
              <span class="${dealStatusBadgeClass(client.status)}">${escapeHtml(client.status)}</span>
              <select class="client-card__status-select" data-status aria-label="Статус сделки">
                ${DEAL_STATUSES.map(
                  (s) =>
                    `<option value="${escapeHtml(s)}" ${s === client.status ? "selected" : ""}>${escapeHtml(s)}</option>`,
                ).join("")}
              </select>
            </div>
          </div>
        </div>
        ${nextStrip}
        <div class="tabs" role="tablist">
          <button type="button" class="tabs__btn ${tab === "deal" ? "is-active" : ""}" data-tab="deal">Сделка</button>
          <button type="button" class="tabs__btn ${tab === "history" ? "is-active" : ""}" data-tab="history">История</button>
          <button type="button" class="tabs__btn ${tab === "products" ? "is-active" : ""}" data-tab="products">Товары</button>
          <button type="button" class="tabs__btn ${tab === "ai" ? "is-active" : ""}" data-tab="ai">AI-помощник</button>
        </div>
        <div class="tab-panel" data-panel></div>
      </div>
    `;

    const panel = container.querySelector("[data-panel]");
    const cardRoot = container.querySelector("[data-client-card]");

    container.querySelectorAll("[data-tab]").forEach((b) => {
      b.addEventListener("click", () => {
        tab = b.dataset.tab;
        render();
      });
    });

    container.querySelector("[data-status]").addEventListener("change", (e) => {
      client.status = e.target.value;
      hooks.onClientUpdate?.(client);
      render();
    });

    container.querySelector("[data-open-faq]")?.addEventListener("click", () => {
      openFAQPanel({ onInsert: hooks.insertDraft || (() => {}) });
    });

    container.querySelector("[data-done-next]")?.addEventListener("click", (e) => {
      e.target.closest(".client-card__next-strip")?.remove();
      client.nextAction = null;
      hooks.onClientUpdate?.(client);
      showToast("Следующий шаг отмечен выполненным", "success");
    });
    container.querySelector("[data-snooze]")?.addEventListener("click", () => {
      showToast("Напоминание перенесено (демо)", "info");
    });

    container.querySelector("[data-act-call]")?.addEventListener("click", () => showToast("Инициируем звонок (демо)", "info"));
    container.querySelector("[data-act-write]")?.addEventListener("click", () => showToast("Открываем чат (демо)", "info"));
    container.querySelector("[data-act-task]")?.addEventListener("click", () => showToast("Создана задача (демо)", "info"));

    if (tab === "deal") {
      const prodOrderBtn = deal.productionOrderId
        ? `<button type="button" class="btn" data-open-prod>Статус производства</button>`
        : "";
      panel.innerHTML = `
        <div class="deal-product deal-product--clickable" data-open-sku-main>
 <div class="deal-product__img" style="background:${deal.color}">\u2726</div>
          <div class="deal-product__info">
            <h3>${escapeHtml(deal.product)}</h3>
            <div class="deal-product__sku">Арт. ${escapeHtml(deal.sku)} · нажмите для карточки SKU</div>
            <div class="deal-product__price">${escapeHtml(formatRub(deal.price))}</div>
            <span class="${stockBadgeClass(deal.stock)}" data-deal-stock>${escapeHtml(deal.stock)}</span>
            <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">
              <button type="button" class="btn btn--gold" data-find-photo>Найти фото</button>
              <button type="button" class="btn" data-sku-card>Карточка SKU</button>
              ${prodOrderBtn}
            </div>
          </div>
        </div>
        <div class="notes-block">
          <label for="notes-${client.id}">Заметки</label>
          <textarea id="notes-${client.id}" data-notes placeholder="Введите заметку — сохранится автоматически…">${escapeHtml(notes)}</textarea>
        </div>
      `;
      const ta = panel.querySelector("[data-notes]");
      ta.addEventListener("input", () => {
        notes = ta.value;
        localStorage.setItem(storageKey, notes);
      });
      const openSkuMain = () => openSkuForClient(client, deal.sku);
      panel.querySelector("[data-open-sku-main]")?.addEventListener("click", openSkuMain);
      panel.querySelector("[data-sku-card]")?.addEventListener("click", (e) => {
        e.stopPropagation();
        openSkuMain();
      });
      panel.querySelector("[data-open-prod]")?.addEventListener("click", () => {
        if (deal.productionOrderId) openOrderStatusPanel(deal.productionOrderId);
      });
      panel.querySelector("[data-find-photo]")?.addEventListener("click", () => {
        const related = mediaItems.filter((m) => m.sku === deal.sku || m.stone === "Сапфир").slice(0, 6);
        const cells = related.length
          ? related
              .map(
                (m) =>
                  `<div class="photo-strip__cell" style="background:${m.color}" title="${escapeHtml(m.name)}">\u2726</div>`,
              )
              .join("")
          : `<p style="margin:0;color:var(--muted)">Нет превью в демо-наборе — загрузите файлы в контент-центр.</p>`;
        openModal(
          `<p style="margin:0 0 12px;font-weight:600">Материалы по артикулу и коллекции</p><div class="photo-strip">${cells}</div>`,
          { large: true },
        );
      });
    } else if (tab === "history") {
      panel.innerHTML = `<div class="timeline">
        ${client.history
          .map(
            (h) => `
          <div class="timeline__item">
            <div class="timeline__icon">${timelineIcon(h.type)}</div>
            <p class="timeline__text">${escapeHtml(h.text)}</p>
            <div class="timeline__meta">${escapeHtml(h.date)} · ${escapeHtml(h.author)}</div>
          </div>`,
          )
          .join("")}
      </div>`;
    } else if (tab === "products") {
      panel.innerHTML = `<div class="products-mini-grid" data-products-grid>
        ${client.products
          .map(
            (p, idx) => `
          <div class="product-mini" data-pidx="${idx}">
            <div class="product-mini__img" style="background:${p.color}" data-open-sku="${escapeHtml(p.sku)}"></div>
            <button type="button" class="linkish" data-sku-link="${escapeHtml(p.sku)}" style="font-weight:600;text-align:left">${escapeHtml(p.name)}</button>
            <div style="font-size:0.85rem;color:var(--muted)">${escapeHtml(p.sku)}</div>
            <div class="product-mini__actions">
              <span class="${stockBadgeClass(p.stock)}" data-stock-badge>${escapeHtml(p.stock)}</span>
              ${
                p.stock !== "Резерв" && p.stock !== "Продан"
                  ? `<button type="button" class="btn" data-reserve>Зарезервировать</button>`
                  : ""
              }
            </div>
          </div>`,
          )
          .join("")}
      </div>`;
      panel.querySelectorAll("[data-sku-link], [data-open-sku]").forEach((el) => {
        const sku = el.dataset.skuLink || el.dataset.openSku;
        el.addEventListener("click", (e) => {
          e.preventDefault();
          openSkuForClient(client, sku);
        });
      });
      panel.querySelectorAll("[data-reserve]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const mini = btn.closest(".product-mini");
          const idx = Number(mini.dataset.pidx);
          client.products[idx].stock = "Резерв";
          if (client.products[idx].sku === client.deal.sku) {
            client.deal.stock = "Резерв";
          }
          mini.classList.add("pulse-stock");
          const badge = mini.querySelector("[data-stock-badge]");
          badge.className = stockBadgeClass("Резерв");
          badge.textContent = "Резерв";
          btn.remove();
          hooks.onClientUpdate?.(client);
          showToast("Товар зарезервирован", "success");
        });
      });
    } else {
      panel.innerHTML = `<div data-ai-root></div>`;
      mountAIAssistant(panel.querySelector("[data-ai-root]"), client, { insertDraft: hooks.insertDraft });
    }

  }

  render();
  return { focusAITab: () => { tab = "ai"; render(); }, focusDealTab: () => { tab = "deal"; render(); } };
}
