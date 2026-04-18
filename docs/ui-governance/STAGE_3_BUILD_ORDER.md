# Stage 3 — Screen parity: порядок работ

1. **App shell + Topbar + Sidebar** — crumb как в demo, правая зона: поиск + уведомления + аватар; выход в сайдбаре.
2. **Owner Dashboard** — структура demo: head, exec-strip, KPI, графики/воронка, менеджеры, источники, лента, AI-сводка.
3. **Sales Workspace** — `sales-layout`: список + детальная панель (превью + ссылка на полную карточку).
4. **Content Center** — header, UX-banner, поиск, чипы, сетка `media-card`.
5. **Product Catalog** — таблица в стиле demo-panel / `managers-table`.
6. **Product / Client detail** — классы `sku-detail` / композиция как в demo (итерация после ядра).
7. **Modals / overlays** — точечно при затрагивании экранов.
8. **Состояния** — empty / loading / error на каждом экране по мере готовности блоков.

Статус реализации в коде:

- **1–3** — `AppShell`: классы `.topbar` / `.topbar__crumb` / `.topbar__right` из demo, глобальный поиск, колокол, аватар, выход в сайдбаре; `getShellCrumb`.
- **4** — `OwnerDashboardClient` + импорт `styles/components.css` в `globals.css`; структура как в `Dashboard.js` (exec-strip, KPI, воронка, менеджеры, источники, лента, AI-блок).
- **5** — `SalesWorkspace`: `.sales-layout`, список, фильтры, empty state, превью `client-card` + ссылка «Полная карточка» на `/app/sales/[id]`.
- **6** — `ContentCenterClient`: `.content-header`, UX-banner, toolbar, `.filter-chip`, `.media-grid` / `.media-card`.
- **7** — `CatalogPage`: `.dashboard-head` + `.panel` + `.managers-table`.

Дальше: **8–12** — детальные SKU/клиент в разметке `sku-detail` / полный `ClientCard`, модалки контента, унификация форм и таблиц, явные loading/error слоты.
