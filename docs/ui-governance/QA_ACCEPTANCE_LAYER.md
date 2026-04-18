# QA Acceptance Layer — Final

Три линии защиты: **QA**, **Front-end**, **Design**. Закрытие — в тикете релиза / RC с ссылками на матрицу и отчёт регрессии.

---

## 1. Final QA checklist (обязательно перед RC)

- [ ] Все строки **заявленного scope** в матрице: `parity` или `n_a` с notes, либо `exception` + **approved** + rationale ([DEMO_TO_WEB_ALIGNMENT_GUIDE.md](./DEMO_TO_WEB_ALIGNMENT_GUIDE.md)).
- [ ] [PARITY_CHECKLIST_FINAL.md](./PARITY_CHECKLIST_FINAL.md) пройден для scope (или задокументированы исключения).
- [ ] Side-by-side / overlay с **demo** на desktop эталоне для каждого критического экрана Wave 1.
- [ ] Адаптив: минимум **mobile390×844** + **tablet 768** на shell, sales, content, dashboard.
- [ ] Состояния из матрицы: empty, error, loading, disabled, modal, long content — выборочно пориску PR.
- [ ] Модалки: ESC, фокус, скролл фона, нет «прыжков» контента.
- [ ] Доступность smoke: таб по основным интерактивам, видимый focus-visible, подписи у иконок в топбаре.
- [ ] Регрессия: `npm run test:e2e` **зелёный** или приложена заполненная **ручная** таблица из [REGRESSION_BASELINE_AND_PROCESS.md](./REGRESSION_BASELINE_AND_PROCESS.md).
- [ ] **Perceived quality:** явная запись в отчёте QA — «web не слабее demo» **да/нет**; при «нет» — блокер или ticket с P0/P1.
- [ ] Открытые пункты [PRODUCTION_DISCOUNT_BLOCKERS.md](./PRODUCTION_DISCOUNT_BLOCKERS.md) согласованы с владельцем продукта.

---

## 2. Review checklist for Front-end (перед мержем UI PR)

- [ ] Сверка с **demo-файлом/скрином**, не только с макетом.
- [ ] Использованы токены/классы эталона; новые «магические» числа обоснованы или убраны.
- [ ] Состояния интерактивов реализованы полностью для затронутых компонентов.
- [ ] Нет лишнего CLS на типовых действиях; анимации согласованы с `--duration-*` / эталоном.
- [ ] Адаптив проверен на 390 / 768 / 1440; mobile drawer не ломает сценарий.
- [ ] Модалки/оверлеи: z-index, scroll lock, клик по backdrop.
- [ ] Обновлены строки матрицы / чеклист в описании PR.
- [ ] Если меняется визуал Wave 1: обновлён Playwright baseline **после** ревью (`test:e2e:update`).

---

## 3. Review checklist for Design

- [ ] Эталон demo актуален (коммит/путь/скрин).
- [ ] Для новых отклонений от demo подготовлено **exception** с одним из 4 оснований Alignment Guide.
- [ ] Адаптивные правила (stack/collapse/drawer) не скрывают primary action.
- [ ] Состояния и микроанимации описаны или подтверждены «как в demo».
- [ ] Подпись: макет/спека не противоречат demo без явного approval exception.

---

## 4. Parity verification notes (что приложить к тикету)

Краткий шаблон:

```text
Scope: Wave 1 / кастом: ______
Demo ref: commit ______ / скрины: ______
Web ref: commit ______
Матрица: (ссылка на Sheet или wave-N-export.csv)

Регрессия:
- Playwright: PASS / FAIL (артефакт: playwright-report/)
- Ручной harness: (ссылка)

Perceived quality: web не слабее demo — ДА/НЕТ (ФИО, дата)

Открытые blockers: нет / см. PRODUCTION_DISCOUNT_BLOCKERS.md §___
```

---

## 5. Ссылки

- [QUALITY_GATES.md](./QUALITY_GATES.md)  
- [DEFINITION_OF_DONE_UI_PARITY.md](./DEFINITION_OF_DONE_UI_PARITY.md)  
- [STAGE_5_QUALITY_GATE_LAYER.md](./STAGE_5_QUALITY_GATE_LAYER.md)
