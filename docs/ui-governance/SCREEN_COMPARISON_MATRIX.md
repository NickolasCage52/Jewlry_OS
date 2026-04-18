# Screen & State Comparison Matrix

## Назначение

Практический инструмент **demo ↔ web**: одна строка = один экран или **состояние** экрана. Используется в Google Sheets / Excel или как CSV: [matrices/screen-state-matrix.template.csv](./matrices/screen-state-matrix.template.csv).

## Колонки (обязательные)

| Колонка | Описание |
|---------|----------|
| `id` | Уникальный id строки (например `W1-DASH-DEFAULT`). |
| `wave` | Волна аудита (1, 2, …). |
| `screen_name` | Человекочитаемое имя. |
| `demo_reference` | Как сослаться на demo: модуль файл + при необходимости hash коммита / скрин в хранилище артефактов. |
| `web_route` | Путь Next (например `/app/dashboard`). |
| `state` | `default` / `loading` / `error` / `empty` / `no_access` / `long_content` / `hover` / `focus` / `modal_open` / … |
| `parity_status` | `not_started` / `in_progress` / `parity` / `exception` / `n_a` (нет эталона в demo). |
| `issue_type` | `visual` / `ux` / `token` / `motion` / `a11y` / `responsive` / `none`. |
| `action_required` | Конкретное действие или «—». |
| `exception_status` | `none` / `pending_approval` / `approved`. |
| `rationale_if_exception` | Текст только при `exception`; иначе пусто. |
| `owner` | Ответственный (роль или имя). |
| `verified_by` | QA / дата. |
| `notes` | Ссылки на тикеты. |

## Статусы паритета (правила)

- **`parity`**: на эталонном вьюпорте и в сценарии нет расхождений с demo, либо отклонение сведено к утверждённому exception.
- **`exception`**: заполнены `exception_status=approved` и `rationale_if_exception` с указанием одного из 4 допустимых оснований из Alignment Guide.
- **`n_a`**: в demo нет экрана; для web действует только внутренняя консистентность + **app shell** должен соответствовать эталону навигации/оболочки (уточняется в notes).

## Wave 1 — начальный набор строк (скопировать в CSV)

Первую волну нужно **дублировать по состояниям** (минимум `default`; далее `loading`, `error`, `empty` где применимо).

| id | wave | screen_name | demo_reference | web_route | state (минимум) |
|----|------|-------------|----------------|-----------|-----------------|
| W1-SHELL |1 | App shell (sidebar + top area) | `src/components/Sidebar.js`, `TopBar.js`, `styles/components.css` | любой `/app/*` под аутентификацией | default; mobile nav |
| W1-NAV | 1 | Навигация primary | `Sidebar.js` + поведение активного пункта | `/app/*` (сверка пунктов с `APP_NAV`) | default; active item |
| W1-LOGIN | 1 | Экран входа | *уточнить эталон* (в demo может отсутствовать) | `/login` | default; error |
| W1-DASH | 1 | Owner Dashboard | `src/modules/dashboard/Dashboard.js` | `/app/dashboard` | default; loading; empty если есть |
| W1-SALES-LIST | 1 | Sales workspace | `src/modules/sales/Sales.js` | `/app/sales` | default; empty; filter |
| W1-SALES-DETAIL | 1 | Sale / client detail | `ClientCard.js`, `Pipeline.js` (контекст) | `/app/sales/[id]` | default; long_content |
| W1-CONTENT | 1 | Content Center | `src/modules/content/ContentCenter.js` | `/app/content` | default; empty |
| W1-CONTENT-ID | 1 | Content item | `ContentCenter.js` / медиа сетка | `/app/content/[id]` | default |
| W1-CATALOG | 1 | Product catalog | *в demo нет отдельного модуля* → `n_a` или SkuDetail если используется | `/app/catalog`, `/app/catalog/[sku]` | default; empty |
| W1-MODAL | 1 | Модальные паттерны | `src/components/ui/Modal.js` | любая страница с модалкой | open; focus trap |
| W1-FORM | 1 | Формы (типовые поля) | компоненты в модулях sales/content | страницы с `*Form.tsx` | default; error; disabled |
| W1-TABLE | 1 | Таблицы / списки | списки в demo-модулях | `/app/sales`, `/app/catalog`, др. | default; long_content |
| W1-FILTER | 1 | Фильтры / поиск | `SearchBar.js`, фильтры в Sales/Content | `/app/search`, списки | default; active |

**Обязательно расширить** Wave 1 строками для каждого **реально используемого** состояния на маршруте (например `modal_open` на конкретном UX-потоке).

## Где хранить заполненную матрицу

Рекомендация: **Google Sheet** «JBOS Demo-Web Parity» с экспортом в `docs/ui-governance/matrices/wave-N-export.csv` по завершении волны (опционально, для истории в git).
