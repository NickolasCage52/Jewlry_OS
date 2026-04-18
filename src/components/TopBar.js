import { subscribe, getRouteMeta } from "../router.js";

export function mountTopBar(container) {
  container.innerHTML = `
    <header class="topbar">
      <div class="topbar__crumb" data-crumb></div>
      <div class="topbar__right">
        <input type="search" class="topbar__search" placeholder="Глобальный поиск…" aria-label="Глобальный поиск" />
        <button type="button" class="topbar__icon-btn" aria-label="Уведомления">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <div class="topbar__avatar" aria-hidden="true">АС</div>
      </div>
    </header>
  `;

  const crumb = container.querySelector("[data-crumb]");

  function sync() {
    const m = getRouteMeta();
    crumb.textContent = m ? m.crumb : "";
  }

  sync();
  subscribe(sync);
}
