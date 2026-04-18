# UI Governance — Jewelry Business OS (Demo → Web)



Рабочий стандарт проекта для **приведения production web к уровню UX/UI demo-эталона**. Юридически/процессно опирается на документ **«Техническое задание: приведение web-версии к уровню UX/UI demo-эталона»** (внешний артефакт заказчика; принципы воспроизведены в [DEMO_TO_WEB_ALIGNMENT_GUIDE.md](./DEMO_TO_WEB_ALIGNMENT_GUIDE.md)).



## Назначение папки



| Артефакт | Файл |

|----------|------|

| Руководство по выравниванию и процессу | [DEMO_TO_WEB_ALIGNMENT_GUIDE.md](./DEMO_TO_WEB_ALIGNMENT_GUIDE.md) |

| Шаблон матрицы экранов/состояний | [SCREEN_COMPARISON_MATRIX.md](./SCREEN_COMPARISON_MATRIX.md) + [matrices/screen-state-matrix.template.csv](./matrices/screen-state-matrix.template.csv) |

| Quality gates (design / FE / QA / release) | [QUALITY_GATES.md](./QUALITY_GATES.md) |

| **Stage 5 — финальный слой gates + acceptance** | [STAGE_5_QUALITY_GATE_LAYER.md](./STAGE_5_QUALITY_GATE_LAYER.md) |

| **Финальный parity checklist** | [PARITY_CHECKLIST_FINAL.md](./PARITY_CHECKLIST_FINAL.md) |

| **Регрессия: baseline, Playwright, ручной harness** | [REGRESSION_BASELINE_AND_PROCESS.md](./REGRESSION_BASELINE_AND_PROCESS.md) |

| **QA / FE / Design acceptance** | [QA_ACCEPTANCE_LAYER.md](./QA_ACCEPTANCE_LAYER.md) |

| **Blockers «production discount»** | [PRODUCTION_DISCOUNT_BLOCKERS.md](./PRODUCTION_DISCOUNT_BLOCKERS.md) |

| Definition of Done (UI parity) | [DEFINITION_OF_DONE_UI_PARITY.md](./DEFINITION_OF_DONE_UI_PARITY.md) |

| Чеклисты приёмки (краткие) | [ACCEPTANCE_CHECKLISTS.md](./ACCEPTANCE_CHECKLISTS.md) |

| Визуальная регрессия | [VISUAL_REGRESSION_MINIMUM.md](./VISUAL_REGRESSION_MINIMUM.md) |

| Планы этапов | [STAGE_2_IMPLEMENTATION_PLAN.md](./STAGE_2_IMPLEMENTATION_PLAN.md), [STAGE_3_BUILD_ORDER.md](./STAGE_3_BUILD_ORDER.md), [STAGE_4_RISKS_AND_MITIGATIONS.md](./STAGE_4_RISKS_AND_MITIGATIONS.md) |

| Токены и UI-примитивы (web) | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |



## Анализ текущей структуры проекта (обновлено)



### Demo-эталон (корень репозитория)



- **Тип:** SPA без Next, точка входа `demo/index.html`, логика в `demo/src/`.

- **Навигация:** клиентский роутер `src/router.js` — модули `sales`, `content`, `dashboard`.

- **Оболочка:** `src/components/Sidebar.js`, `src/components/TopBar.js`.

- **Ключевые экраны:** `src/modules/sales/Sales.js`, `content/ContentCenter.js`, `dashboard/Dashboard.js` (+ `ClientCard`, `Pipeline`, `MediaGrid`, и т.д.).

- **Стили:** `styles/variables.css`, `styles/components.css` — **источник правды** для визуального языка demo; импорт `components.css` в `web/app/globals.css`.



### Production web (`web/`)



- **Тип:** Next.js 15 (App Router), React 19, Tailwind CSS v4.

- **Шрифты:** Cormorant + Jost (`web/app/layout.tsx`).

- **App shell:** `web/app/app/layout.tsx` + `web/components/shell/AppShell.tsx`.

- **UI-примитивы:** `web/components/ui/*`, токены `web/app/tokens.css`, `ui-primitives.css`.

- **Визуальная регрессия:** Playwright — `npm run test:e2e` (см. [REGRESSION_BASELINE_AND_PROCESS.md](./REGRESSION_BASELINE_AND_PROCESS.md)).



### Сопоставление demo ↔ web (логическое)



| Demo (router id) | Web (маршрут) | Примечание |

|------------------|---------------|------------|

| `dashboard` | `/app/dashboard` | Wave 1 |

| `sales` | `/app/sales`, `/app/sales/[id]` | Список — parity target; деталь — см. blockers |

| `content` | `/app/content`, `/app/content/[id]` | Центр — parity target; деталь — см. blockers |



Остальные маршруты web — по матрице `n_a` или внутренняя консистентность + shell.



## Как пользоваться



1. Заполнить копию [screen-state-matrix.template.csv](./matrices/screen-state-matrix.template.csv).

2. Перед RC: [STAGE_5_QUALITY_GATE_LAYER.md](./STAGE_5_QUALITY_GATE_LAYER.md), [PARITY_CHECKLIST_FINAL.md](./PARITY_CHECKLIST_FINAL.md), [PRODUCTION_DISCOUNT_BLOCKERS.md](./PRODUCTION_DISCOUNT_BLOCKERS.md).

3. Регрессия: `cd web && npm run test:e2e`.

4. Перед мержем/релизом: [QUALITY_GATES.md](./QUALITY_GATES.md) и [DEFINITION_OF_DONE_UI_PARITY.md](./DEFINITION_OF_DONE_UI_PARITY.md).



## Версия



- **Stage 1** — governance + audit framework.  

- **Stages 2–4** — design system, экраны, адаптив/состояния (см. отдельные документы).  

- **Stage 5** — финальные quality gates, Playwright baselines, acceptance layer.


