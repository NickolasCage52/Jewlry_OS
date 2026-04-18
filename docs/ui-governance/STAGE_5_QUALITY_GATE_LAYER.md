# Stage 5 — Quality Gates, Regression Protection, Final Acceptance

Финальный слой: **доказуемость demo-parity**, защита от деградации и **acceptance-ready** состояние для production web.

## 1. Анализ текущего состояния (после Stages 2–4)

### Сделано

| Область | Состояние |
|---------|-----------|
| Дизайн-токены и UI-примитивы | `web/app/tokens.css`, `ui-primitives.css`, `web/components/ui/*`, [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |
| Эталонные классы demo | `styles/components.css` импортирован в `web/app/globals.css` |
| App shell | `AppShell.tsx`: топбар/сайдбар в духе demo, мобильный drawer, scroll-lock, `focus`/адаптивные правки Stage 4 |
| Ключевые списковые экраны | Dashboard, Sales workspace, Content center, Catalog list — выровнены по Wave 1 |
| Сегмент `app` | `loading.tsx` / `error.tsx`, модалка с блокировкой скролла `body` |
| Документация процесса | Gates, DoD, матрица, минимум визуальной регрессии (Stages 1–4) |

### Пробелы относительно эталона (см. blockers)

Детальные маршруты и часть медиа-UX **ещё не** на уровне композиции demo (`ClientCard`, сетка контента, SKU-detail). Это зафиксировано как **релиз-блокеры для заявления полного Wave 1 parity** в [PRODUCTION_DISCOUNT_BLOCKERS.md](./PRODUCTION_DISCOUNT_BLOCKERS.md).

### Инструменты качества

- **Playwright screenshot smoke** в `web/e2e/` — baseline для 5 критических маршрутов (desktop 1440×900), см. [REGRESSION_BASELINE_AND_PROCESS.md](./REGRESSION_BASELINE_AND_PROCESS.md).
- Storybook по-прежнему опционален; приоритет — маршрутные скрины и матрица.

---

## 2. Финальный scope quality gate (что проверяем)

| Слой | Артефакт | Назначение |
|------|-----------|------------|
| Parity checklist | [PARITY_CHECKLIST_FINAL.md](./PARITY_CHECKLIST_FINAL.md) | Полный production-ready чеклист по экранам, компонентам, состояниям, потокам, адаптиву, консистентности, perceived quality |
| Regression | [REGRESSION_BASELINE_AND_PROCESS.md](./REGRESSION_BASELINE_AND_PROCESS.md) | Baseline viewports, critical screens/states, визуальное сравнение, Playwright + ручной harness |
| Definition of Done | [DEFINITION_OF_DONE_UI_PARITY.md](./DEFINITION_OF_DONE_UI_PARITY.md) | Завершённость, блокеры релиза, дефекты, допустимые отклонения, exceptions |
| QA acceptance | [QA_ACCEPTANCE_LAYER.md](./QA_ACCEPTANCE_LAYER.md) | Final QA, FE review, Design review, parity verification notes |
| Production discount | [PRODUCTION_DISCOUNT_BLOCKERS.md](./PRODUCTION_DISCOUNT_BLOCKERS.md) | Явные blockers до «web не слабее demo» |
| Gates (процесс) | [QUALITY_GATES.md](./QUALITY_GATES.md) | D / F / Q / R + Stage 5 |

---

## 3. Критерий готовности к приёмке (summary)

Production web считается **готовым к приёмке относительно demo** для заявленного scope только если:

1. Закрыты **Gate D, F, Q, R** для этого scope.
2. Выполнен [DEFINITION_OF_DONE_UI_PARITY.md](./DEFINITION_OF_DONE_UI_PARITY.md).
3. Пройден [PARITY_CHECKLIST_FINAL.md](./PARITY_CHECKLIST_FINAL.md) для scope (или зафиксированы `exception approved`).
4. Выполнен регрессионный минимум: `npm run test:e2e` в `web/` (или эквивалентный ручной прогон с артефактами по [REGRESSION_BASELINE_AND_PROCESS.md](./REGRESSION_BASELINE_AND_PROCESS.md)).
5. В [PRODUCTION_DISCOUNT_BLOCKERS.md](./PRODUCTION_DISCOUNT_BLOCKERS.md) **нет открытых блокеров** для заявляемой волны parity (или каждый закрыт работой/exception).

---

## 4. Навигация по репозиторию

| Путь | Описание |
|------|----------|
| `web/e2e/parity-screenshots.spec.ts` | Автоскрины Wave 1 |
| `web/e2e/*-snapshots/*.png` | Зафиксированные baseline (платформо-зависимые имена) |
| `docs/ui-governance/matrices/screen-state-matrix.template.csv` | Матрица экран/состояние |

## Версия

- **Stage 5** — quality gate layer + Playwright baselines + финальные чеклисты.
