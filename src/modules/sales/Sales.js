import { clients as clientsData } from "../../data/clients.js";
import { getAvatarColor, escapeHtml, initials } from "../../util.js";
import { dealStatusBadgeClass } from "../../components/ui/dealStatus.js";
import { DEAL_STATUSES } from "../../components/ui/dealStatus.js";
import { mountClientCard } from "./ClientCard.js";
import { openFAQPanel } from "../../components/FAQPanel.js";
import { showToast } from "../../components/toast.js";

function listIndicators(c) {
  const inds = [];
  if (c.nextAction?.date?.includes("Просроч") || c.lastAction?.includes("Просроч")) {
    inds.push(`<span class="sales-ind sales-ind--risk">Риск</span>`);
  }
  if (c.lastAction?.includes("VIP")) {
    inds.push(`<span class="sales-ind sales-ind--hot">VIP</span>`);
  }
  if (c.deal?.stock === "Под заказ" || c.products?.some((p) => p.stock === "Под заказ")) {
    inds.push(`<span class="sales-ind sales-ind--hot">Под заказ</span>`);
  }
  if (c.deal?.productionOrderId) {
    inds.push(`<span class="sales-ind">Цех</span>`);
  }
  return inds.join("");
}

export function mountSales(root) {
  const clients = clientsData;
  let selectedId = clients[0]?.id ?? null;
  let filter = "";
  let statusFilter = "";
  let cardApi = null;

  const el = document.createElement("div");
  el.className = "sales-layout";
  el.innerHTML = `
    <aside class="sales-list-panel">
      <div class="sales-list-toolbar">
        <input type="search" placeholder="Поиск по имени…" data-client-search />
        <select class="sales-status-filter" data-status-filter aria-label="Фильтр по статусу">
          <option value="">Все статусы</option>
          ${DEAL_STATUSES.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("")}
        </select>
        <button type="button" class="btn btn--gold" style="width:100%" data-faq-open>База знаний · FAQ</button>
      </div>
      <div class="sales-list" data-client-list></div>
    </aside>
    <section class="sales-detail" data-detail></section>
  `;
  root.appendChild(el);

  const listEl = el.querySelector("[data-client-list]");
  const detailEl = el.querySelector("[data-detail]");
  const searchInput = el.querySelector("[data-client-search]");
  const statusSelect = el.querySelector("[data-status-filter]");

  function insertIntoActiveField(text) {
    const inp = detailEl.querySelector("[data-ai-input]");
    const notes = detailEl.querySelector("[data-notes]");
    if (inp) {
      inp.value = (inp.value ? `${inp.value}\n\n` : "") + text;
      inp.focus();
      showToast("Текст вставлен в поле AI-помощника", "success");
      return;
    }
    if (notes) {
      notes.value = (notes.value ? `${notes.value}\n\n` : "") + text;
      showToast("Текст добавлен в заметки к клиенту", "success");
      return;
    }
    showToast("Откройте карточку клиента", "info");
  }

  function filtered() {
    let list = clients;
    if (statusFilter) {
      list = list.filter((c) => c.status === statusFilter);
    }
    const q = filter.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }

  function renderList() {
    const list = filtered();
    if (list.length === 0) {
      listEl.innerHTML = `
        <div class="empty-illustration" data-empty-list>
          <svg class="empty-illustration__art" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="10" y="20" width="100" height="60" rx="8" fill="var(--border)"/>
            <circle cx="45" cy="48" r="14" fill="var(--muted2)"/>
            <rect x="68" y="38" width="36" height="8" rx="2" fill="var(--muted)"/>
            <rect x="68" y="52" width="28" height="8" rx="2" fill="var(--muted2)"/>
          </svg>
          <p><strong>Клиенты не найдены</strong></p>
          <p>Измените запрос, фильтр или сбросьте поиск</p>
        </div>`;
      return;
    }

    listEl.innerHTML = list
      .map((c) => {
        const sel = c.id === selectedId ? "is-selected" : "";
        const bg = getAvatarColor(c.name);
        const ini = initials(c.name);
        const sub = c.lastAction ? `${escapeHtml(c.lastAction)} · ${escapeHtml(c.lastContact)}` : escapeHtml(c.lastContact);
        const ind = listIndicators(c);
        return `
        <div class="sales-list__item ${sel}" data-client-id="${c.id}" role="button" tabindex="0">
          <div class="sales-list__avatar" style="background:${bg}">${escapeHtml(ini)}</div>
          <div class="sales-list__meta">
            <div class="sales-list__name">${escapeHtml(c.name)}</div>
            <div class="sales-list__sub">${sub}</div>
            ${ind ? `<div class="sales-list__indicators">${ind}</div>` : ""}
            <span class="${dealStatusBadgeClass(c.status)}">${escapeHtml(c.status)}</span>
          </div>
        </div>`;
      })
      .join("");

    listEl.querySelectorAll("[data-client-id]").forEach((row) => {
      const id = Number(row.dataset.clientId);
      const open = () => {
        selectedId = id;
        renderList();
        renderDetail();
      };
      row.addEventListener("click", open);
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  function renderDetail() {
    const c = clients.find((x) => x.id === selectedId);
    if (!c) {
      detailEl.innerHTML = `
        <div class="sales-detail__empty">
          <svg class="sales-detail__empty-art" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="60" cy="78" rx="40" ry="8" fill="var(--border)"/>
            <circle cx="60" cy="42" r="22" fill="var(--gold-border)"/>
            <circle cx="60" cy="40" r="22" fill="var(--gold-pale)"/>
            <path d="M52 36 L68 36 L60 50 Z" fill="var(--gold)"/>
          </svg>
          <p><strong>Выберите клиента</strong></p>
          <p>Слева список контактов — клик откроет карточку</p>
        </div>`;
      cardApi = null;
      return;
    }

    detailEl.innerHTML = `<div data-card-root></div>`;
    const cardRoot = detailEl.querySelector("[data-card-root]");
    cardApi = mountClientCard(cardRoot, c, {
      onClientUpdate: () => renderList(),
      insertDraft: insertIntoActiveField,
    });
  }

  searchInput.addEventListener("input", () => {
    filter = searchInput.value;
    const list = filtered();
    if (!list.some((c) => c.id === selectedId)) {
      selectedId = list[0]?.id ?? null;
    }
    renderList();
    renderDetail();
  });

  statusSelect.addEventListener("change", () => {
    statusFilter = statusSelect.value;
    const list = filtered();
    if (!list.some((c) => c.id === selectedId)) {
      selectedId = list[0]?.id ?? null;
    }
    renderList();
    renderDetail();
  });

  el.querySelector("[data-faq-open]").addEventListener("click", () => {
    openFAQPanel({ onInsert: insertIntoActiveField });
  });

  renderList();
  renderDetail();

  return {
    el,
    selectClient(id) {
      selectedId = id;
      renderList();
      renderDetail();
    },
    setSearch(q) {
      filter = q;
      searchInput.value = q;
      const list = filtered();
      if (!list.some((c) => c.id === selectedId)) selectedId = list[0]?.id ?? null;
      renderList();
      renderDetail();
    },
    setStatusFilter(s) {
      statusFilter = s;
      statusSelect.value = s;
      const list = filtered();
      if (!list.some((c) => c.id === selectedId)) selectedId = list[0]?.id ?? null;
      renderList();
      renderDetail();
    },
    focusSearch() {
      searchInput.focus();
    },
    openFAQ() {
      openFAQPanel({ onInsert: insertIntoActiveField });
    },
    getSearchEl: () => searchInput,
    getListEl: () => listEl,
    getDetailEl: () => detailEl,
    openAITab() {
      cardApi?.focusAITab?.();
    },
    openDealTab() {
      cardApi?.focusDealTab?.();
    },
  };
}
