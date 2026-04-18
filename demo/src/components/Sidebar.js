import { navigate, subscribe, getRoute } from "../router.js";

const LINKS = [
  { route: "sales", label: "Продажи", icon: "\u25C6" },
  { route: "content", label: "Контент", icon: "\u25A3" },
  { route: "dashboard", label: "Собственник", icon: "\u25CB" },
];

export function mountSidebar(container) {
  container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <span class="sidebar__diamond" aria-hidden="true"></span>
        <span class="sidebar__title">Jewelry OS</span>
      </div>
      <nav class="sidebar__nav" aria-label="Разделы">
        ${LINKS.map(
          (l) => `
          <button type="button" class="sidebar__link" data-route="${l.route}">
            <span aria-hidden="true">${l.icon}</span>
            ${l.label}
          </button>`,
        ).join("")}
      </nav>
      <div class="sidebar__user">
        <div class="sidebar__user-avatar">АС</div>
        <div>
          <div class="sidebar__user-name">Анна Смирнова</div>
          <div class="sidebar__user-role">Менеджер продаж</div>
        </div>
      </div>
    </aside>
  `;

  function sync() {
    const r = getRoute();
    container.querySelectorAll("[data-route]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.route === r);
    });
  }

  container.querySelectorAll("[data-route]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.route));
  });

  sync();
  subscribe(sync);
}
