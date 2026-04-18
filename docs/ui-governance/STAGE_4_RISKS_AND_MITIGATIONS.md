# Stage 4 — Зоны риска: адаптив, состояния, motion, shift, overlays

## 1. Adaptive

| Риск | Проявление | Митигация |
|------|------------|-----------|
| **Нет навигации &lt; md** | Сайдбар `hidden md:flex` — сценарий блокирован | Drawer меню из топбара (эталон: demo перестраивает sidebar ≤900px) |
| **Crumb + топбар на узкой ширине** | Переполнение, сдвиг правой зоны | `truncate` на crumb, сохранение `topbar__right` |
| **Sales two-column** | Уже в `components.css` (column + max-height списка) | Проверка overflow-x на таблицах каталога |
| **Dashboard сетки** | `kpi-row`, `charts-row`, `exec-strip` имеют breakpoints в demo CSS | Опора на импорт `components.css` |
| **Контент main** | Скачок padding md | Токены `--content-pad-x-mobile` / `--content-pad-x` в `globals.css` |

## 2. States

| Риск | Митигация |
|------|-----------|
| **focus-visible на кастомных контролах** | Кольцо на `.funnel-bar-wrap`, drawer-кнопках |
| **disabled / loading** | Уже на `Button`; формы — по мере миграции |
| **empty** | Sales / Content — есть; расширять на каталог при 0 строк |
| **error / no access** | Сегментный `error.tsx`; no access — существующие guard в layout |
| **async** | `loading.tsx` в `/app` — скелетон demo-стиля |

## 3. Motion / microinteractions

| Риск | Митигация |
|------|-----------|
| **Избыточная анимация** | Только эталонные кривые/длительности; без новых «украшений» |
| **a11y motion** | `@media (prefers-reduced-motion: reduce)` — отключение ключевых анимаций |
| **Drawer** | `transform` + `var(--ease-out)` как у demo slide-over |

## 4. Layout shift (CLS)

| Риск | Митигация |
|------|-----------|
| **Modal открытие** | `overflow: hidden` на `body` на время модалки |
| **Контент без высоты** | Скелетон с фиксированными блоками в `loading.tsx` |
| **AI-блок на дашборде** | Появление по действию — ожидаемый shift; при необходимости `scroll-margin` |

## 5. Overlays (modal / drawer / scroll)

| Риск | Митигация |
|------|-----------|
| **Фон скроллится под модалкой** | Scroll lock в `Modal` |
| **Drawer без фокуса** | Закрытие по Escape и клику по backdrop; первый фокус на контейнере |
| **Z-index конфликты** | Drawer 105, backdrop 104, модалка 200+ (существующие) |

---

Реализация см. `web/app/stage4-enhancements.css`, `AppShell.tsx`, `Modal.tsx`, `app/app/loading.tsx`, `app/app/error.tsx`.
