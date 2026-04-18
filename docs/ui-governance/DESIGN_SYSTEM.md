# Design System — Web (demo-эталон)

Источник правды по визуалу: **demo** (`styles/variables.css`, `styles/components.css`). В `web/` дублируются токены и примитивы; расхождение без документированного exception запрещено (см. [DEMO_TO_WEB_ALIGNMENT_GUIDE.md](./DEMO_TO_WEB_ALIGNMENT_GUIDE.md)).

## Файлы

| Файл | Назначение |
|------|------------|
| `web/app/tokens.css` | CSS variables: цвета, layout, radius, shadow, motion, spacing scale, typography scale, legacy aliases |
| `web/app/ui-primitives.css` | Классы `.ui-*`, повторяющие эталонные паттерны demo |
| `web/app/globals.css` | Импорт токенов + примитивов, Tailwind `@theme`, базовые стили body, `.app-main` |
| `web/components/ui/*` | React-обёртки над `.ui-*` |

## Токены: использование

- **Цвета:** `--ink`, `--ink2`, `--muted`, `--gold`, `--cream`, `--white`, `--border`, семантика `--status-*`.
- **Совместимость:** `--foreground` = `--ink`, `--surface` = `--white`, `--background` = `--cream`, `--accent` = `--gold`, `--danger` = `--status-red`.
- **Отступы контента:** `--content-pad-x`, `--content-pad-y-top`, `--content-pad-y-bottom` (как `.main-content` в demo); на узких экранах — `--content-pad-x-mobile`.
- **Шкала `--space-*`:** для новых компонентов вместо произвольных px.
- **Шрифты:** задаются в `web/app/layout.tsx` через `next/font` (Cormorant Garamond + Jost) → переменные `--font-display`, `--font-body`.

## Компоненты: варианты и правила

### Button (`ui-btn`)

| Variant | Классы | Эталон demo |
|---------|--------|---------------|
| `default` | `ui-btn` | `.btn` |
| `primary` | `ui-btn--primary` | `.btn--primary` |
| `gold` | `ui-btn--gold` | `.btn--gold` |
| `ghost` | `ui-btn--ghost` | `.btn--ghost` |
| `sm` | `ui-btn--sm` | `.btn--sm` |

**Состояния:** hover/active в CSS; `disabled` — opacity + `cursor: not-allowed`; `loading` — проп `loading` + `aria-busy`, спиннер `.ui-btn__spinner`.

### Input / Textarea / Select

- База: `.ui-input`, `.ui-textarea`, `.ui-select`.
- `variant="cream"` → фон как у части полей в demo.
- `error` → `.ui-*--error`, `aria-invalid`.
- **Focus:** кольцо как у `.faq-search:focus` (золотая обводка + `box-shadow`).

### SearchInput / TopbarSearch

- `SearchInput` — контент/тулбар (`.content-search`).
- `TopbarSearch` — `.topbar__search` (ширина 220px, скрывается &lt;900px в AppShell).

### Tabs

- Разметка WAI-ARIA tabs; стили `.ui-tabs`, `.ui-tab`, `.ui-tab-panel` = demo `.tabs*`.

### Card

- `.ui-card`, опционально `--padding`, `--hover` (тень при hover как `.media-card`).

### Modal

- Клиентский `Modal`: backdrop `.modal-backdrop`, окно `.modal`, анимации как в demo.

### Table

- Обёртка `.ui-table-wrap` + `.ui-table`; строка hover `.managers-table`.

### FilterChip / Badge

- `FilterChip`: `pressed` → `aria-pressed` + стиль `.filter-chip.is-active`.
- `Badge`: `tone` = blue | amber | gold | gray | green | red → классы `.badge--*`.

## Shell

- Сайдбар: `.ui-nav-link`, активный `.ui-nav-link--active` = `.sidebar__link.is-active`.
- Икон-кнопка: `.ui-icon-btn`.

## Состояния (обязательный набор для примитивов)

| Состояние | Реализация |
|-----------|------------|
| default | базовые классы |
| hover | `:hover` в CSS |
| active | `:active` / `aria-pressed` |
| focus-visible | `.ui-focusable` или встроенные `:focus-visible` на полях |
| disabled | атрибут `disabled`, стили кнопки |
| loading | `Button` + `loading` |
| error | `Input`/`Textarea`/`Select` + `error` |

**empty** относится к составным виджетам (списки, таблицы) — на уровне страниц (Stage screen alignment).

## Исключения

- Кастомный **dropdown** (не native `<select>`) в этой итерации не введён: используется нативный `Select`; при необходимости listbox — отдельный компонент и строка в матрице аудита.
- Шрифты загружаются через **Google Fonts** в Next.js вместо `<link>` в demo — эквивалент web-среды, глифы те же семейства.

## Миграция экранов

Новые и правимые блоки **обязаны** использовать `@/components/ui`. Точечные `rounded-lg bg-gray-…` на существующих страницах — технический долг; убираются по мере экранных задач (Stage 2C+).
