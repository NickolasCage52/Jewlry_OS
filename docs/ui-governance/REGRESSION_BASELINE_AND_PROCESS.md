# Regression Baseline & Process — Demo ↔ Web

Цель: **зафиксировать эталон** и дать воспроизводимый процесс, чтобы визуальная деградация не проходила незамеченной.

---

## 1. Baseline viewports (обязательный набор)

| Имя | Размер | Назначение |
|-----|--------|------------|
| Desktop эталон | **1440 × 900** | Сверка с demo; Playwright по умолчанию |
| Laptop | 1280 × 800 | Плотность, переносы |
| Tablet | 768 × 1024 | Перестроение контента |
| Mobile | 390 × 844 | Drawer, первичный сценарий |

Для каждого релиза Wave N: минимум **desktop + mobile** для критических маршрутов; остальные — по риску изменений.

---

## 2. Critical screens (автоматический + ручной минимум)

| Маршрут | Автоскрин Playwright | Ручные состояния (доп.) |
|---------|----------------------|-------------------------|
| `/app/dashboard` | да | loading, empty если в матрице |
| `/app/sales` | да | empty, фильтр active |
| `/app/sales/1` (mock id) | да | long_content |
| `/app/content` | да | empty, modal если в UX |
| `/app/catalog` | да | empty |
| `/app/catalog/[sku]` | нет (добавить при стабильном SKU) | детальный parity |
| `/app/content/[id]` | нет | детальный parity |
| `/login` | нет | error query |

Файлы: `web/e2e/parity-screenshots.spec.ts`, конфиг `web/playwright.config.ts`.

---

## 3. Critical states (чеклист перед релизом)

По затронутым экранам из матрицы:

- default, hover, active, focus-visible  
- disabled, loading- empty, error, no access  
- modal_open (где применимо)  
- long_content / overflow  

---

## 4. Visual comparison process

1. **Demo:** зафиксировать эталон (запуск статики, тот же viewport, те же данные по возможности).  
2. **Web:** тот же viewport, mock-данные, та же роль (рекомендуется OWNER для скринов).  
3. Сравнение: overlay / side-by-side; расхождения → колонка `action_required` в матрице.  
4. При изменении намеренного UI: обновить baseline (`npm run test:e2e:update` в `web/`) **только** после Design/FE sign-off.

---

## 5. Screenshot-based regression (Playwright)

### Установка

```bash
cd web
npm install
npx playwright install chromium
```

### Команды

| Команда | Действие |
|---------|----------|
| `npm run test:e2e` | Прогон: поднимает dev server (если не занят), логин setup, сравнение с PNG baseline |
| `npm run test:e2e:update` | Перезаписать baseline после утверждённых визуальных изменений |
| `npm run test:e2e:ui` | Интерактивный режим отладки |

### Платформы

Имена снапшотов по умолчанию включают **OS** (например `*-chromium-win32.png`). Для CI на Linux:

- один раз выполнить `npm run test:e2e:update` на том же окружении, что и CI, и закоммитить сгенерированные `*-linux.png`, **или**
- зафиксировать в pipeline образ/раннер **Windows** под эти тесты.

**Блокер мержа:** падение `test:e2e` без обоснованного обновления baseline и ревью диффа.

---

## 6. Structured manual regression harness

Если Playwright недоступен (нет браузеров, офлайн):

Скопировать таблицу в тикет:

| Дата | Маршрут | Viewport | Demo скрин (ссылка) | Web скрин (ссылка) | Статус | Примечание |
|------|---------|----------|---------------------|--------------------|--------|------------|
| | | | | | OK / FAIL | |

Минимум строк: все **Critical screens** × desktop + mobile.

---

## 7. Связь с quality gates

- Gate **Q**: пройден viewport matrix + критические состояния.  
- Gate **R**: приложены артефакты (отчёт Playwright HTML или ручная таблица + скрины).

См. также [VISUAL_REGRESSION_MINIMUM.md](./VISUAL_REGRESSION_MINIMUM.md) (исторический минимум; Playwright расширяет его).
