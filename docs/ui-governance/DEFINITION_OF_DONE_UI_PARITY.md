# Definition of Done — UI Parity (Demo ↔ Web)

Задача по выравниванию считается **Done** только при выполнении **всех** пунктов, относящихся к заявленному scope (маршрут / компонент / волна матрицы).

## 1. Матрица

- [ ] Все строки scope в матрице имеют `parity_status` = `parity` или `n_a` с обоснованием в `notes`.
- [ ] Для любой строки `exception`: `exception_status` = `approved`, заполнен `rationale_if_exception` (одно из 4 оснований).
- [ ] Указаны `owner` и `verified_by` для закрытых строк.

## 2. Визуал и система

- [ ] На эталонном вьюпорте нет заметной деградации относительно demo: иерархия, ритм, типографика, цветовые отношения, форм-фактор ключевых контролов.
- [ ] Повторяющиеся компоненты консистентны между экранами scope.
- [ ] Нет «библиотечных заглушек» вместо решений demo без полного выравнивания.

## 3. Поведение и состояния

- [ ] UX-логика соответствует demo: порядок шагов, обратная связь, сохранение контекста.
- [ ] Реализованы согласованные состояния: hover, active, focus-visible, disabled, loading, error, empty (и прочие из строк матрицы для scope).
- [ ] Модалки, фильтры, формы ведут себя предсказуемо и в духе эталона.

## 4. Адаптив

- [ ] Перестроения соответствуют утверждённым правилам; первичное действие и первичная информация доступны.
- [ ] Нет неконтролируемого горизонтального переполнения (кроме явно допустимых зон).

## 5. Источники и регрессия

- [ ] Нет конфликта «макет vs demo vs production» без разрешения: приоритет demo соблюдён.
- [ ] Выполнен минимум проверок из [VISUAL_REGRESSION_MINIMUM.md](./VISUAL_REGRESSION_MINIMUM.md) для scope.

## 6. Субъективный барьер (обязательно)

- [ ] Уполномоченный ревьюер фиксирует: **web не воспринимается слабее, проще или дешевле demo** при прямом сравнении.

Если любой пункт не выполнен — статус задачи **не Done** (возврат в работу или оформление exception).

---

## 7. Stage 5 — Release readiness (финальный слой)

Задача по волне parity считается **релизной** (acceptance-ready для production) только если дополнительно:

- [ ] Выполнен [STAGE_5_QUALITY_GATE_LAYER.md](./STAGE_5_QUALITY_GATE_LAYER.md) §3 (критерий готовности).
- [ ] Пройден [PARITY_CHECKLIST_FINAL.md](./PARITY_CHECKLIST_FINAL.md) для заявленного scope **или** каждое незакрытое пункт оформлен как approved exception в матрице.
- [ ] Регрессия: зелёный `npm run test:e2e` в `web/` **или** эквивалентный ручной пакет артефактов ([REGRESSION_BASELINE_AND_PROCESS.md](./REGRESSION_BASELINE_AND_PROCESS.md)).
- [ ] В [PRODUCTION_DISCOUNT_BLOCKERS.md](./PRODUCTION_DISCOUNT_BLOCKERS.md) **нет открытых блокеров** для этой волны (либо каждый закрыт работой/exception с подписью владельца).

### Что блокирует релиз при заявлении «demo parity Wave 1»

- Любой открытый блокер из [PRODUCTION_DISCOUNT_BLOCKERS.md](./PRODUCTION_DISCOUNT_BLOCKERS.md) без approved exception.
- Падение gate Q или R ([QUALITY_GATES.md](./QUALITY_GATES.md)).
- Отсутствие артефактов сверки (Playwright report / скрины / экспорт матрицы) в тикете релиза.

### Что считается дефектом

- Любое **не задокументированное** визуальное или поведенческое уступание demo на экране, заявленном как `parity`.
- Регрессия baseline (падение `test:e2e`) без ревью и обновления снапшотов.
- Потеря иерархии, primary action или сценария на адаптиве относительно утверждённых правил.

### Допустимые отклонения

Только **exception approved** с rationale по одному из четырёх оснований в [DEMO_TO_WEB_ALIGNMENT_GUIDE.md](./DEMO_TO_WEB_ALIGNMENT_GUIDE.md), с записью в матрице (`exception_status=approved`, `rationale_if_exception`).

### Оформление exceptions

1. Строка матрицы: `parity_status=exception`, заполнены rationale и ссылка на тикет/решение.  
2. При необходимости — короткая заметка в PR и обновление [PRODUCTION_DISCOUNT_BLOCKERS.md](./PRODUCTION_DISCOUNT_BLOCKERS.md) (перевод пункта в «закрыт»).
