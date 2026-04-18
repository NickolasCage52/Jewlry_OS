import { mediaItems } from "../../data/products.js";
import { contentStats } from "../../data/content.js";
import { escapeHtml } from "../../util.js";
import { mountSearchBar } from "./SearchBar.js";
import { renderMediaGrid } from "./MediaGrid.js";
import { openModal } from "../../components/ui/Modal.js";
import { openSkuDetail } from "../../components/SkuDetail.js";
import { getSkuDetail } from "../../data/skuCatalog.js";
import { showToast } from "../../components/toast.js";

const CHANNEL_CHIPS = [
  { id: "all", label: "Все", match: () => true },
  { id: "photo", label: "Фото", match: (i) => i.type === "photo" },
  { id: "video", label: "Видео", match: (i) => i.type === "video" },
  { id: "source", label: "Исходники", match: (i) => i.type === "source" },
  { id: "ads", label: "Для рекламы", match: (i) => i.channel.some((c) => c === "для рекламы") },
  { id: "sales", label: "Для продаж", match: (i) => i.channel.some((c) => c === "для продаж") },
  { id: "avito", label: "Авито", match: (i) => i.channel.some((c) => c === "авито") },
  { id: "social", label: "Соцсети", match: (i) => i.channel.some((c) => c === "соцсети") },
];

const CATEGORIES = ["Все", "Кольца", "Серьги", "Колье", "Браслеты", "Подвески"];
const METALS = ["Все", "Золото 585", "Золото 750", "Серебро", "Платина"];
const STONES = ["Все", "Бриллиант", "Сапфир", "Изумруд", "Рубин", "Аметист", "Без вставки"];

function matchesSearch(item, q) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const blob = [item.name, item.sku, item.category, item.metal, item.stone, ...item.channel].join(" ").toLowerCase();
  return blob.includes(s);
}

function isSapphireQuery(q) {
  return q.toLowerCase().includes("сапфир");
}

function openMediaModal(item) {
  const tags = [item.category, item.metal, item.stone].map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(" ");
  const sku = getSkuDetail(item.sku);
  const channelTags = item.channel.map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join(" ");
  const relatedLine = sku
    ? `<p style="margin:0 0 8px;font-size:0.9rem"><strong>${escapeHtml(sku.name)}</strong> · ${escapeHtml(sku.metal)} · ${escapeHtml(sku.stone)} · ${sku.price != null ? escapeHtml(String(sku.price.toLocaleString("ru-RU"))) + " \u20BD" : "—"}</p>`
    : "";

  const { backdrop } = openModal(
    `
    <div class="content-modal-body">
      <div class="content-modal-preview" style="background:${item.color}"></div>
      <div class="content-modal-side">
        <h3 style="margin:0 0 8px;font-family:var(--font-display)">${escapeHtml(item.name)}</h3>
        <p style="margin:0 0 12px;color:var(--muted)">Арт. ${escapeHtml(item.sku)} · ${escapeHtml(item.type)} · ${escapeHtml(item.date)}</p>
        <p style="margin:0 0 8px"><strong>Категория:</strong> ${escapeHtml(item.category)}</p>
        <p style="margin:0 0 8px"><strong>Металл:</strong> ${escapeHtml(item.metal)}</p>
        <p style="margin:0 0 12px"><strong>Вставка:</strong> ${escapeHtml(item.stone)}</p>
        <div style="margin-bottom:14px">${tags}</div>
        <h4 style="margin:0 0 8px;font-family:var(--font-display);font-size:1.05rem">Используется в каналах</h4>
        <div style="margin-bottom:16px;display:flex;flex-wrap:wrap;gap:6px">${channelTags}</div>
        <h4 style="margin:0 0 8px;font-family:var(--font-display);font-size:1.05rem">Связанный товар (SKU)</h4>
        <div style="margin-bottom:16px;padding:12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--cream)">
          ${relatedLine}
          <button type="button" class="btn btn--primary" data-open-sku-modal>Открыть карточку SKU</button>
        </div>
        <p style="margin:0 0 14px;font-size:0.88rem;color:var(--muted);line-height:1.5">\u2726 Раньше это были папки и чаты. Теперь артикул, каналы и файлы — в одной карточке; поиск по тегу занимает секунды.</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <button type="button" class="btn btn--primary" data-dl>Скачать</button>
          <button type="button" class="btn" data-copy>Скопировать ссылку</button>
          <button type="button" class="btn" data-bind>Привязать к товару</button>
        </div>
      </div>
    </div>`,
    { large: true },
  );

  backdrop.querySelector("[data-open-sku-modal]")?.addEventListener("click", () => {
    openSkuDetail(item.sku);
  });
  backdrop.querySelector("[data-dl]")?.addEventListener("click", () => showToast("Загрузка начата (демо)", "success"));
  backdrop.querySelector("[data-bind]")?.addEventListener("click", () => showToast("Привязка к SKU сохранена (демо)", "success"));
}

export function mountContentCenter(root) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <header class="content-header">
      <div>
        <h1>Контент-центр</h1>
        <div class="content-header__sub"><span data-count>${contentStats.totalMaterials.toLocaleString("ru-RU")}</span> материалов · обновлено сегодня</div>
      </div>
      <button type="button" class="btn btn--gold" data-upload>+ Загрузить</button>
    </header>
    <div class="content-ux-banner">
      <div class="content-ux-banner__icon">\u2726</div>
      <div class="content-ux-banner__text">
        <strong>Искали в папках 15 минут — находите за 5 секунд</strong>
        <p>Единый поиск по артикулу, камню и каналу. Материалы привязаны к SKU: менеджер и маркетинг видят одну версию правды.</p>
      </div>
    </div>
    <div data-sapphire-banner style="display:none"></div>
    <div class="content-bulk-bar" hidden data-bulk-bar>
      <span>Выбрано материалов: <strong data-bulk-n>0</strong> · демо-режим</span>
      <div class="content-bulk-bar__actions">
        <button type="button" class="btn" data-bulk-zip>Скачать архив</button>
        <button type="button" class="btn" data-bulk-links>Экспорт ссылок</button>
        <button type="button" class="btn" data-bulk-board>В подборку клиента</button>
      </div>
    </div>
    <div class="content-toolbar">
      <div data-search-slot style="flex:1;min-width:200px"></div>
      <button type="button" class="btn" data-bulk-demo>Массовые действия</button>
      <div class="grid-toggle">
        <button type="button" data-cols="3" class="is-active" title="Три колонки">3</button>
        <button type="button" data-cols="4" title="Четыре колонки">4</button>
      </div>
    </div>
    <div class="filter-chips" data-channel-chips></div>
    <div class="filter-row">
      <select data-cat>${CATEGORIES.map((c) => `<option>${escapeHtml(c)}</option>`).join("")}</select>
      <select data-metal>${METALS.map((c) => `<option>${escapeHtml(c)}</option>`).join("")}</select>
      <select data-stone>${STONES.map((c) => `<option>${escapeHtml(c)}</option>`).join("")}</select>
    </div>
    <div data-grid></div>
  `;
  root.appendChild(wrap);

  let chipActive = "all";
  let cols = 3;
  let query = "";
  let cat = "Все";
  let metal = "Все";
  let stone = "Все";
  let bulkOn = false;

  const gridHost = wrap.querySelector("[data-grid]");
  const bannerEl = wrap.querySelector("[data-sapphire-banner]");
  const chipsHost = wrap.querySelector("[data-channel-chips]");

  const searchApi = mountSearchBar(wrap.querySelector("[data-search-slot]"), {
    placeholder: "Поиск по названию, тегу, артикулу…",
    onQuery: (v) => {
      query = v;
      refresh();
    },
  });

  function renderChips() {
    chipsHost.innerHTML = CHANNEL_CHIPS.map(
      (c) =>
        `<button type="button" class="filter-chip ${c.id === chipActive ? "is-active" : ""}" data-chip="${c.id}">${escapeHtml(c.label)}</button>`,
    ).join("");
    chipsHost.querySelectorAll("[data-chip]").forEach((b) => {
      b.addEventListener("click", () => {
        chipActive = b.dataset.chip;
        renderChips();
        refresh();
      });
    });
  }

  function applyFilters() {
    const chip = CHANNEL_CHIPS.find((c) => c.id === chipActive);
    return mediaItems.filter((item) => {
      if (!chip.match(item)) return false;
      if (cat !== "Все" && item.category !== cat) return false;
      if (metal !== "Все" && item.metal !== metal) return false;
      if (stone !== "Все" && item.stone !== stone) return false;
      if (!matchesSearch(item, query)) return false;
      return true;
    });
  }

  function refresh() {
    const sapphire = isSapphireQuery(query);
    if (sapphire) {
      bannerEl.style.display = "block";
      bannerEl.innerHTML = `<div class="search-banner">\u2726 Найдено ${contentStats.sapphireSearchResultCount} материала по запросу «сапфир» — за ${contentStats.sapphireSearchMs} сек</div>`;
    } else {
      bannerEl.style.display = "none";
      bannerEl.innerHTML = "";
    }

    let items = applyFilters();
    if (sapphire) {
      items = items.filter((i) => i.stone === "Сапфир" || i.name.toLowerCase().includes("сапфир"));
    }

    renderMediaGrid(gridHost, items, cols);

    gridHost.querySelectorAll(".media-card").forEach((card) => {
      const id = Number(card.dataset.mediaId);
      const item = mediaItems.find((m) => m.id === id);
      const open = () => item && openMediaModal(item);
      card.addEventListener("click", (e) => {
        if (e.target.closest(".media-card__overlay")) return;
        open();
      });
      card.querySelector("[data-open]")?.addEventListener("click", (e) => {
        e.stopPropagation();
        open();
      });
      card.querySelector("[data-copy]")?.addEventListener("click", (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`https://demo.jewelry-os.local/media/${id}`);
      });
      card.querySelector("[data-dl]")?.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
  }

  wrap.querySelector("[data-cat]").addEventListener("change", (e) => {
    cat = e.target.value;
    refresh();
  });
  wrap.querySelector("[data-metal]").addEventListener("change", (e) => {
    metal = e.target.value;
    refresh();
  });
  wrap.querySelector("[data-stone]").addEventListener("change", (e) => {
    stone = e.target.value;
    refresh();
  });

  wrap.querySelectorAll("[data-cols]").forEach((b) => {
    b.addEventListener("click", () => {
      cols = Number(b.dataset.cols);
      wrap.querySelectorAll("[data-cols]").forEach((x) => x.classList.toggle("is-active", Number(x.dataset.cols) === cols));
      refresh();
    });
  });

  const bulkBar = wrap.querySelector("[data-bulk-bar]");
  const bulkN = wrap.querySelector("[data-bulk-n]");
  wrap.querySelector("[data-bulk-demo]").addEventListener("click", () => {
    bulkOn = !bulkOn;
    bulkBar.hidden = !bulkOn;
    bulkN.textContent = bulkOn ? "3" : "0";
    showToast(bulkOn ? "Выбрано 3 материала (демо)" : "Массовый режим выключен", "info");
  });
  bulkBar.querySelector("[data-bulk-zip]")?.addEventListener("click", () => showToast("Архив подготовлен (демо)", "success"));
  bulkBar.querySelector("[data-bulk-links]")?.addEventListener("click", () => showToast("Ссылки экспортированы (демо)", "success"));
  bulkBar.querySelector("[data-bulk-board]")?.addEventListener("click", () => showToast("Подборка отправлена в CRM (демо)", "success"));
  wrap.querySelector("[data-upload]")?.addEventListener("click", () => showToast("Загрузка файлов (демо)", "info"));

  renderChips();
  refresh();

  return {
    el: wrap,
    setSearch(q) {
      searchApi.setValue(q);
    },
    focusSearch() {
      searchApi.focus();
    },
    getSearchInput: () => searchApi.getInput(),
  };
}
