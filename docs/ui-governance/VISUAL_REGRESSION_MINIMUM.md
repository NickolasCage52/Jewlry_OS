# Visual Regression — минимальный реалистичный путь

**Текущее состояние (Stage 5):** в `web/` подключён **Playwright** (`@playwright/test`) — смок-тесты со скриншотами Wave 1 и процесс в [REGRESSION_BASELINE_AND_PROCESS.md](./REGRESSION_BASELINE_AND_PROCESS.md). Storybook / Percy по-прежнему опциональны.

## 1. Screenshot baselines (обязательный минимум)

1. Зафиксировать **эталонный вьюпорт** для demo (например 1440×900) и тот же для web.
2. Для каждой строки Wave 1 матрицы: сохранить **PNG эталона**:
   - demo: запуск статики demo, скрин модуля в состоянии `default` (и других по матрице).
   - web: тот же маршрут, те же данные (mock), тот же вьюпорт.
3. Хранить в **внешнем** артефакт-хранилище (Drive / Figma / вложения тикета) или в `docs/ui-governance/screenshots/wave-1/` **только если** политика репозитория позволяет бинарники; иначе — ссылка в README матрицы.

**Правило сравнения:** слой наложения или split-view; расхождения фиксируются в колонке `action_required`.

## 2. Viewport matrix (обязательно для QA)

| Viewport | Ширина × высота | Назначение |
|----------|-----------------|------------|
| Desktop эталон | 1440 × 900 (или согласованный) | Pixel-parity с demo |
| Laptop | 1280 × 800 | Проверка ритма |
| Tablet | 768 × 1024 | Перестроение навигации |
| Mobile | 390 × 844 | Минимальный сценарий без поломки иерархии |

Для каждого viewport: **скрин только для критических маршрутов** Wave 1 (shell, dashboard, sales, content, catalog).

## 3. Storybook (опционально, Stage 2+)

**Цель:** изолированные состояния кнопок, инпутов, карточек, модалок.

**Когда внедрять:** после появления переиспользуемых UI-примитивов в `web/components/ui/*` (сейчас отсутствуют — внедрение связано с design system alignment).

## 4. Playwright / automated screenshot (внедрено, Stage 5)

Реализовано в репозитории:

- `web/playwright.config.ts`, `web/e2e/auth.setup.ts`, `web/e2e/parity-screenshots.spec.ts`.
- Команды: `npm run test:e2e`, `npm run test:e2e:update` (в каталоге `web/`).
- Baseline PNG в `web/e2e/parity-screenshots.spec.ts-snapshots/`; падение диффа — **блокер** до ревью и осознанного обновления baseline.
- Платформенные суффиксы снапшотов: см. [REGRESSION_BASELINE_AND_PROCESS.md](./REGRESSION_BASELINE_AND_PROCESS.md) §5.

## 5. Manual comparison harness

Если Playwright недоступен в окружении:

- Таблица «маршрут | вьюпорт | demo скрин | web скрин | дата | статус» — шаблон в [REGRESSION_BASELINE_AND_PROCESS.md](./REGRESSION_BASELINE_AND_PROCESS.md) §6.
- Перед релизом Wave N: **регрессия по чеклисту** из [QUALITY_GATES.md](./QUALITY_GATES.md) Gate Q.

## 6. Рекомендуемый порядок внедрения

1. Stage 1–2: ручные скрины + viewport matrix.  
2. Stage 2: токены и примитивы → Storybook по желанию.  
3. Stage 3–5: Playwright screenshot для Wave 1 (`web/e2e/`) + ручной harness для mobile/tablet и состояний.
