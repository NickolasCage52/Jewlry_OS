import { escapeHtml } from "../../util.js";

function channelLabel(ch) {
  const map = {
    "для рекламы": "Для рекл",
    "для продаж": "Для продаж",
    "исходники": "Исходн",
    авито: "Авито",
    соцсети: "Соцсети",
  };
  return map[ch] || ch;
}

function fileKind(item) {
  if (item.type === "video") return "MP4";
  if (item.type === "source") return "PSD";
  return "JPG";
}

export function renderMediaGrid(container, items, cols) {
  container.className = `media-grid media-grid--${cols}`;
  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-illustration" style="grid-column:1/-1">
        <svg class="empty-illustration__art" viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="20" y="25" width="120" height="70" rx="10" fill="var(--border)"/>
          <circle cx="70" cy="58" r="18" fill="var(--muted2)"/>
          <rect x="98" y="48" width="32" height="8" rx="2" fill="var(--muted)"/>
          <rect x="98" y="62" width="24" height="8" rx="2" fill="var(--muted2)"/>
        </svg>
        <p><strong>Ничего не найдено</strong></p>
        <p>Попробуйте другой запрос или сбросьте фильтры</p>
      </div>`;
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
    <article class="media-card" data-media-id="${item.id}">
      <div class="media-card__thumb-wrap">
        <div class="media-card__thumb" style="background:${item.color}"></div>
        <div class="media-card__overlay">
          <button type="button" class="btn" data-copy>Скопировать ссылку</button>
          <button type="button" class="btn" data-dl>Скачать</button>
          <button type="button" class="btn btn--primary" data-open>Открыть</button>
        </div>
      </div>
      <div class="media-card__body">
        <h3 class="media-card__title">${escapeHtml(item.name)}</h3>
        <div class="media-card__sku">Арт. ${escapeHtml(item.sku)}</div>
        <div class="media-card__tags">
          <span class="tag">${escapeHtml(item.category)}</span>
          ${item.channel
            .slice(0, 2)
            .map((c) => `<span class="tag">${escapeHtml(channelLabel(c))}</span>`)
            .join("")}
        </div>
        <div class="media-card__meta">${escapeHtml(item.date)} · ${fileKind(item)} · ${escapeHtml(item.size)}</div>
      </div>
    </article>`,
    )
    .join("");
}
