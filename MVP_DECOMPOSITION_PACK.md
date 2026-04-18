# Jewelry Business OS — MVP Decomposition Pack (Stage 3)

**Версия:** 1.0  
**Назначение:** build-ready декомпозиция для старта разработки MVP (без production-кода).  
**Источники:** текущая демо-архитектура (`demo_operation_site`), заявленные модули MOD-A…E, роли OWNER / MKT / SALES / STOCK / SUPPLY / ADMIN.  
**Примечание:** файл PRD в репозитории не обнаружен; при расхождении с вашим PRD этот пакет нужно сверить и скорректировать.

---

## 1. Current state analysis

### 1.1 Структура демо (факт)

- **Тип:** статическая SPA на ES-модулях + CSS, без сборки и backend.
- **Навигация:** простой роутер (`sales` | `content` | `dashboard`), три смонтированных корня.
- **Данные:** файловые моки (`clients`, `products`/`mediaItems`, `metrics`, `faq`, `skuCatalog`, `productionOrders`).
- **UI-паттерны:** список + деталь (продажи), грид + модалка (контент), панели + графики (дашборд); slide-over/modal для SKU, FAQ, производства; demo spotlight.

### 1.2 Что уже хорошо определено (продуктово)

- Три **ядра UX**: рабочее место продаж, контент-центр, кабинет собственника — совпадают с приоритетом MVP.
- **Сквозная линия «клиент → сделка → товар/SKU → медиа → сигналы сверху»** в демо прослеживается.
- Есть задел под **единый справочник ответов (FAQ)** и **карточку SKU** как связующее звено.

### 1.3 Чего не хватает для build-ready MVP

- **Единый источник правды** по сущностям (каталог vs склад vs CRM) — в демо смешаны уровни.
- **Явная модель авторизации, tenancy, аудита** — отсутствуют.
- **Идентификаторы и версионность** (SKU, медиа, сделка) не зафиксированы как контракты API.
- **Границы интеграций** (1C, Bitrix, склад) не формализованы — риск скрытых зависимостей.
- **Правила статусов** сделки, резерва, остатков — в демо упрощены до бейджей.

### 1.4 Размытые зоны (scope creep risk)

- **«AI-слой»** без жёсткого MVP-cut превращается в отдельный продукт.
- **Производство / supply** — в демо есть панель статуса; в MVP легко утащить полный MES.
- **Кампании и маркетинговая аналитика** — соблазн тянуть полноценный MKT-стек.
- **Полный каталог** (конфигуратор, кастом-заказы, ценообразование) — отдельный bounded context.
- **Импорты** (Google Sheets, выгрузки) — без явного scope дадут бесконечный хвост.

### 1.5 Вывод

Демо отлично **продаёт историю** и **фиксирует экраны ядра**, но для MVP нужно **жёстко зафиксировать сущности, права, контракты и интеграционные «заглушки»**, иначе разработка уйдёт в параллельные «мини-MVP».

---

## 2. MVP entity model (domain)

**Соглашения:** `PK` — первичный ключ; `FK` — внешний; `MVP` / `Post-MVP` — вхождение в первую поставку.

| Entity | Purpose | Key fields (логические) | Relationships | MVP |
|--------|---------|-------------------------|---------------|-----|
| **User** | Учётная запись | `id`, `email`, `name`, `status`, `lastLoginAt`, `locale` | N:M **Role** через **UserRole**; N:1 **ActivityEvent** (как actor) | MVP |
| **Role** | RBAC-роль | `id`, `code` (OWNER, SALES, …), `label` | N:M **Permission** через **RolePermission** | MVP |
| **Permission** | Атомарное право | `id`, `code` (e.g. `deal:edit_status`), `module`, `description` | M:N **Role** (через RolePermission) | MVP |
| **UserRole** | Назначение роли | `userId`, `roleId`, `assignedAt`, `assignedBy` | — | MVP |
| **Client** | Контрагент / лид CRM | `id`, `fullName`, `phones[]`, `emails[]`, `source`, `ownerUserId`, `tags[]`, `createdAt` | 1:N **Deal**; 1:N **Note**; 1:N **ActivityEvent**; 1:N **Reminder** | MVP |
| **Deal** | Сделка | `id`, `clientId`, `status` (enum), `primaryProductId?`, `valueEstimate?`, `currency`, `openedAt`, `closedAt?`, `assignedToUserId` | N:1 **Client**; позиции через **DealLine**; N:M **MediaAsset** (weak link) | MVP |
| **DealLine** | Позиция в сделке | `id`, `dealId`, `productId` или `sku`, `qty`, `role` (primary, alt), `priceSnapshot?` | N:1 **Deal**; N:1 **Product** | MVP |
| **Task** | Задача (операционная) | `id`, `title`, `dueAt`, `status`, `assigneeUserId`, `clientId?`, `dealId?`, `createdBy` | Опционально к **Client/Deal** | **P1** (если в MVP только **Reminder** — см. ниже) |
| **Reminder** / **NextAction** | Следующий шаг по клиенту/сделке | `id`, `clientId`, `dealId?`, `type`, `dueAt`, `status`, `createdBy` | 1:1 или N:1 к **Deal** | MVP (минимум) |
| **Note** | Заметка | `id`, `body`, `clientId`, `authorUserId`, `createdAt`, `visibility` | N:1 **Client** | MVP |
| **FAQItem** | База знаний | `id`, `category`, `question`, `answer`, `locale`, `version`, `updatedAt`, `status` | — | MVP |
| **Product** | Товар (логическая модель) | `id`, `name`, `collection?`, `category`, `description?`, `baseMetal`, `defaultStone?`, `status` | 1:N **ProductVariant** | MVP |
| **ProductVariant** | SKU / вариант | `id`, `productId`, `sku` (unique), `attrs` (size, weight, stone specs), `masterPrice?`, `currency`, `isActive` | N:1 **Product**; 1:N **InventoryRecord** | MVP |
| **ProductStatus** | Справочник/enum | коды: `active`, `discontinued`, `made_to_order`, … | — | MVP |
| **InventoryRecord** | Остаток по SKU | `id`, `variantId`, `locationId`, `qtyOnHand`, `qtyReserved`, `qtyInbound?`, `updatedAt` | N:1 **ProductVariant**; N:1 **Location** | MVP |
| **Location** | Склад / витрина | `id`, `type` (showroom, warehouse, transit), `name` | 1:N **InventoryRecord** | MVP |
| **Reservation** | Резерв под сделку | `id`, `variantId`, `dealId`, `qty`, `expiresAt`, `status` | Связывает склад и сделку | **P1** (MVP может обойтись полем `qtyReserved` + простым правилом) |
| **MediaAsset** | Файл / логическая единица контента | `id`, `type` (image, video, source), `title`, `storageKey`, `mime`, `bytes`, `checksum?`, `createdAt`, `createdBy` | N:M **ProductVariant** (через **MediaLink**); N:M **Tag** | MVP |
| **MediaLink** | Привязка медиа к SKU | `mediaId`, `variantId`, `role` (hero, lifestyle, cert_scan…) | — | MVP |
| **MediaTag** / **Tag** | Теги | `id`, `name`, `kind` (channel, campaign, stone, …) | M:N **MediaAsset** | MVP (минимум: строковые теги + индекс) |
| **Channel** | Канал использования | справочник: ads, retail, marketplace, social… | Связь с **MediaAsset** (как тег или FK) | MVP (как enum/tag) |
| **ActivityEvent** | Лента активности | `id`, `type`, `payload`, `actorUserId`, `clientId?`, `dealId?`, `createdAt` | Аудит + feed | MVP (минимум) |
| **DashboardMetric** | KPI snapshot | `id`, `key`, `period`, `value`, `dimensions?`, `computedAt` | Derived | MVP (агрегация) |
| **Alert** / **Signal** | Критический сигнал | `id`, `severity`, `code`, `message`, `refs`, `createdAt`, `acknowledgedBy?` | Derived / rule engine | **P1** (MVP: статичные правила + API список) |
| **ProductionOrder** | Заказ в производство | `id`, `variantId?`, `stage`, `dueAt`, `owner`, `status`, `comments[]` | Post-MVP / **Phase 2** для полноценного цеха | **Post-MVP** (в MVP — опциональная заглушка или ручной статус) |
| **Campaign** / **SourceSummary** | Маркетинг | агрегаты по источникам | Derived | **Post-MVP** (в MVP дашборд: простая разбивка лидов) |
| **AuditLog** | Админ-аудит | `id`, `userId`, `action`, `entityType`, `entityId`, `diff?`, `ip?`, `createdAt` | — | MVP (для ADMIN действий) |

**Derived / computed:** `DashboardMetric`, лента `ActivityEvent` для дашборда, «сигналы», конверсии воронки, доступность SKU (`computedAvailability`).

**Первичные сущности (ядро):** `User`, `Role`, `Permission`, `Client`, `Deal`, `Product`/`ProductVariant`, `MediaAsset`, `InventoryRecord`, `FAQItem`, `Note`, `Reminder`, `ActivityEvent`.

---

## 3. Role & permission model

### 3.1 Роли и scope

| Role | Scope | MVP focus |
|------|--------|-----------|
| **OWNER** | Весь бизнес-контур read-heavy + критические действия | Дашборд, сигналы, обзор команды/воронки, без операционной рутины склада |
| **SALES** | Клиенты, сделки, резервы (в рамках политики), контент read, FAQ | Ядро MVP |
| **MKT** | Медиа, теги, каналы, привязки к SKU, поиск | Ядро MVP |
| **STOCK** | Остатки, перемещения, корректировки, резервы (по политике) | MVP: базовые остатки + просмотр резервов |
| **SUPPLY** | Закупка / производство / поставки | **Post-MVP** или Phase 2 (в MVP только read или отсутствует) |
| **ADMIN** | Пользователи, роли, аудит, справочники | MVP: пользователи + роли + базовый аудит |

### 3.2 Module access (high level)

Легенда: **Y** — полный доступ по роли, **R** — в основном просмотр, **W** — рабочие операции, **—** — нет доступа (или отдельная политика).

| Module | OWNER | MKT | SALES | STOCK | SUPPLY | ADMIN |
|--------|-------|-----|-------|-------|--------|-------|
| Auth / session | Y | Y | Y | Y | — | Y |
| Owner dashboard | Y | — | — | — | — | — |
| Sales / CRM | R* | — | W | R | R | R |
| Content center | R | W | R | R | R | R |
| Catalog / SKU | R | R | R | R | R | R |
| Inventory | R | R | R | W | R | R |
| FAQ | R | W | R | R | R | W |
| Settings / users | — | — | — | — | — | W |

\* OWNER: расширенный read по CRM без правки медиа/остатков — уточнить в PRD.

### 3.3 Permission matrix (action-level, пример кодов)

Уровни: **view | create | edit | delete | export | approve | admin**.

| Permission code | Description | OWNER | MKT | SALES | STOCK | SUPPLY | ADMIN |
|-----------------|-------------|-------|-----|-------|-------|--------|-------|
| `client:view` | Просмотр клиента | Y | — | Y | Y* | Y* | Y |
| `client:create` | Создание клиента | — | — | Y | — | — | Y |
| `client:edit` | Редактирование контактов | — | — | Y | — | — | Y |
| `client:delete` | Удаление (soft) | — | — | — | — | — | admin |
| `deal:view` | Просмотр сделки | Y | — | Y | R | R | Y |
| `deal:create` | Новая сделка | — | — | Y | — | — | Y |
| `deal:edit_status` | Смена статуса воронки | — | — | Y | — | — | Y |
| `deal:assign` | Назначение ответственного | Y | — | Y** | — | — | Y |
| `note:create` | Заметки | R | — | Y | — | — | Y |
| `reminder:create` | Next action | — | — | Y | — | — | Y |
| `inventory:view` | Остатки | Y | R | Y | Y | Y | Y |
| `inventory:adjust` | Корректировка | — | — | — | Y | — | admin |
| `reservation:create` | Резерв под сделку | — | — | Y*** | Y*** | — | admin |
| `reservation:release` | Снятие резерва | — | — | Y*** | Y | — | admin |
| `product:view` | Каталог / SKU | Y | Y | Y | Y | Y | Y |
| `product:edit_master` | Мастер-цена, активность | — | — | — | — | — | admin |
| `media:view` | Просмотр медиа | Y | Y | Y | Y | Y | Y |
| `media:upload` | Загрузка | — | Y | — | — | — | Y |
| `media:edit_meta` | Теги, каналы, привязка SKU | — | Y**** | R | — | — | Y |
| `media:delete` | Удаление | — | Y | — | — | — | admin |
| `faq:view` | FAQ | Y | Y | Y | Y | Y | Y |
| `faq:edit` | Редактирование FAQ | — | Y | — | — | — | Y |
| `dashboard:view_owner` | Кабинет собственника | Y | — | — | — | — | — |
| `report:export` | Выгрузки | Y | Y | — | Y | — | admin |
| `user:admin` | Управление пользователями | — | — | — | — | — | admin |

\* Только если связано с отгрузкой/остатками (политика tenant).  
\** Team lead / старший менеджер — конфигурируемо.  
\*** Резерв: в MVP либо упрощённое правило «только STOCK подтверждает», либо SALES с лимитом — зафиксировать в PRD.  
\**** Опционально: SALES может «предлагать привязку», MKT «утверждает» — Post-MVP workflow.

---

## 4. Screen / route map (MVP)

### 4.1 Обязательные маршруты (MVP)

| Route | Screen | Тип | MVP |
|-------|--------|-----|-----|
| `/login` | Login | page | Yes |
| `/forgot-password` | Восстановление (stub OK) | page | P1 |
| `/` | Redirect по роли | — | Yes |
| `/dashboard` | Owner dashboard | page (OWNER) | Yes |
| `/sales` | Список клиентов / pipeline lite | page | Yes |
| `/sales/clients/:clientId` | Карточка клиента | page (deep link) | Yes |
| `/sales/clients/:clientId/deals/:dealId` | Сделка (если отдельно от клиента) | page или tab state | P1 / nested |
| `/content` | Контент-центр | page | Yes |
| `/content/assets/:assetId` | Деталь актива | drawer или page | Yes |
| `/catalog` | Список товаров / SKU | page | Yes |
| `/catalog/skus/:sku` | Карточка SKU | drawer предпочтительно | Yes |
| `/faq` | FAQ (или drawer из sales) | page или global drawer | Yes |
| `/settings/users` | Пользователи | page | Yes (ADMIN) |
| `/settings/roles` | Роли (read-only matrix v1) | page | Yes (ADMIN) |
| `/settings/audit` | Аудит | page | P1 |
| `/inventory` | Остатки (read SALES, edit STOCK) | page | Yes |

### 4.2 Nested / modal / drawer (рекомендация)

- **SKU detail:** drawer (как в демо) + deep link `?sku=` или `/catalog/skus/:sku`.
- **Media asset:** modal/drawer + shareable URL.
- **Production status:** **Post-MVP** как отдельный модуль; в MVP не давать отдельный маршрут или только read-only stub под флагом.

### 4.3 Post-MVP маршруты (явно не в MVP)

- `/production`, `/supply/purchase-orders`, `/campaigns`, `/ai/assistant`, `/integrations/1c`, полноценный `/tasks` (если не сведён к Reminder).

---

## 5. User flows по ролям (build-ready)

### 5.1 OWNER

**Happy path**

1. Login → redirect на `/dashboard`.
2. Видит KPI, воронку, топ менеджеров, ленту событий (ограниченную политикой приватности).
3. Кликает сигнал / «просрочки» → переход в **список сделок с фильтром** (read-only или с ограниченным действием «назначить ответственного»).
4. Просматривает деталь клиента в read-only или с узким набором действий.
5. Logout.

**MVP-граница:** OWNER **не** редактирует медиа, **не** двигает остатки, **не** меняет мастер-цену.  
**Edge:** если нет прав на PII — маскирование телефонов; пустой дашборд → empty state с онбордингом.

### 5.2 SALES

**Happy path**

1. Login → `/sales`.
2. Поиск/фильтр клиента → открыть карточку.
3. Вкладки: сделка / история / товары / AI (AI **Post-MVP** или «шаблоны» без LLM).
4. Просмотр **наличия** по SKU (read из inventory API).
5. Открыть **контент** по SKU (deep link или встроенный поиск).
6. Открыть **FAQ**, вставить ответ в заметку/шаблон сообщения.
7. Создать **Next action** / напоминание; сменить **статус сделки**; добавить **заметку**.
8. (Опционально MVP) Создать **резерв** — по политике STOCK.

**Edge:** конфликт резерва; просроченный follow-up → видимый alert; офлайн — не в MVP.

### 5.3 MKT

**Happy path**

1. Login → `/content`.
2. Поиск по SKU / камню / каналу; фильтры.
3. Открыть asset → видит метаданные, каналы, связанные SKU.
4. Копирует ссылку / выгружает файл (permission `export` по политике).
5. Редактирует теги / привязку к SKU (permission `media:edit_meta`).

**MVP-граница:** нет полноценного DAM approval workflow; один уровень «опубликовано / черновик» допустим как P1.

### 5.4 ADMIN

**Happy path**

1. Login → `/settings/users`.
2. Создаёт пользователя, назначает роли.
3. Отключает доступ (soft ban).
4. Просматривает **AuditLog** по критичным действиям (минимум: user/role/deal status/media delete).

**Edge:** нельзя удалить последнего ADMIN; смена своей роли запрещена без второго админа.

### 5.5 STOCK (кратко)

1. Login → `/inventory`.
2. Просмотр остатков по location; корректировка с причиной.
3. Просмотр резервов по сделкам; подтверждение/снятие (по политике).

---

## 6. MVP backlog (Epic → Feature → Story)

**Приоритеты:** P0 — обязателен для «первой живой поставки», P1 — сразу после, P2 — по мере необходимости.

### Epic A — Auth & Access (MOD-A)

| Feature | Описание / зачем | Depends on | Pri | MVP |
|---------|------------------|------------|-----|-----|
| Login / session | Доступ к системе | — | P0 | Yes |
| RBAC enforcement | Безопасность и разделение ролей | Users, Roles | P0 | Yes |
| User management | ADMIN создаёт пользователей | Auth | P0 | Yes |
| Audit log (minimal) | Разбор инцидентов | Auth | P1 | Yes |

**Stories (примеры):**  
- Как ADMIN, хочу создать пользователя и назначить роль SALES.  
- Как система, я должна отклонять доступ к `/dashboard` для не-OWNER.

### Epic B — Owner Dashboard (MOD-B)

| Feature | Описание | Depends on | Pri | MVP |
|---------|----------|------------|-----|-----|
| KPI v1 | Выручка, лиды, конверсия, средний чек из агрегатов | Activity, Deals | P0 | Yes |
| Revenue trend chart | Динамика | Metrics API | P0 | Yes |
| Funnel v1 | Этапы воронки | Deals | P0 | Yes |
| Managers leaderboard | Топ по выручке/сделкам | Deals | P1 | Yes |
| Signals / alerts v1 | Просрочки, риски | Reminders, Deals | P1 | Yes |
| AI summary | Текстовая сводка | **AI Layer** | — | **Post-MVP** (MVP: статичный «insight» без LLM опционально) |

### Epic C — Content Center (MOD-C)

| Feature | Описание | Depends on | Pri | MVP |
|---------|----------|------------|-----|-----|
| Asset upload | Загрузка в storage | Auth, Media | P0 | Yes |
| Metadata & tags | Поиск и фильтрация | Media | P0 | Yes |
| Link media ↔ SKU | Связь контента с каталогом | Catalog | P0 | Yes |
| Search | Быстрый поиск | Index | P0 | Yes |
| Bulk actions | Массовые операции | Media | P2 | Post-MVP |
| Channel governance | Сложные статусы каналов | — | P2 | Post-MVP |

### Epic D — Sales / CRM (MOD-D)

| Feature | Описание | Depends on | Pri | MVP |
|---------|----------|------------|-----|-----|
| Client list + search | Базовый CRM | Auth | P0 | Yes |
| Client detail | Контакты, заметки | Client | P0 | Yes |
| Deal + status | Воронка | Client, Permissions | P0 | Yes |
| Activity timeline | История | ActivityEvent | P0 | Yes |
| Next action | Напоминания | Client, Deal | P0 | Yes |
| FAQ quick access | Единые ответы | FAQ | P0 | Yes |
| SKU + availability view | Без хаоса «на складе» | Catalog, Inventory | P0 | Yes |
| Reservation | Резерв | Inventory, policy | P1 | граница MVP (упростить) |
| AI assistant | Подсказки | AI | — | Post-MVP |

### Epic E — Product Catalog (MOD-E)

| Feature | Описание | Depends on | Pri | MVP |
|---------|----------|------------|-----|-----|
| Product + SKU model | Основа | Auth | P0 | Yes |
| SKU detail | Карточка для sales/mkt | Media link | P0 | Yes |
| Master price (protected) | Ценообразование | ADMIN perm | P1 | Yes |
| Made-to-order flags | Логика под заказ | Catalog | P1 | Yes |

### Epic F — Shared system layer

| Feature | Описание | Depends on | Pri | MVP |
|---------|----------|------------|-----|-----|
| Notifications (in-app) | Тосты, счётчики | — | P1 | Yes |
| Global search (P2) | Сквозной поиск | Index | P2 | Post-MVP |
| Feature flags | Постепенный rollout | — | P1 | желательно |

---

## 7. Acceptance criteria (выборочно, проверяемо)

### Auth / Login

- **Given** неавторизованный пользователь **When** открывает `/sales` **Then** перенаправление на `/login`.
- **Given** пользователь с ролью SALES **When** логинится **Then** попадает на `/sales` (или `/` → redirect по политике).
- **System shall** инвалидировать сессию по таймауту (значение из конфига).

### Role access

- **Given** SALES **When** открывает `/settings/users` **Then** HTTP 403 / redirect на разрешённый маршрут.
- **Given** OWNER **When** открывает `/dashboard` **Then** 200 и данные только своего tenant (если multi-tenant).

### Dashboard v1

- **Given** есть сделки за период **When** OWNER открывает дашборд **Then** отображаются 4 KPI с корректной агрегацией за выбранный период.
- **Given** нет данных **When** открыт дашборд **Then** показывается empty state без ошибок.

### Client list

- **Given** 50 клиентов **When** SALES вводит поиск по имени **Then** список фильтруется за &lt; 300 ms p95 (на объёме MVP).
- **Given** фильтр по статусу **When** выбран «Ждёт решения» **Then** в списке только соответствующие клиенты/сделки (контракт уточнить: фильтр по deal.status).

### Client detail

- **Given** клиент с историей **When** открыта карточка **Then** timeline отсортирован по `createdAt` desc.
- **Given** SALES без `client:edit` **When** пытается изменить телефон **Then** поля read-only.

### Next action

- **Given** активный reminder **When** SALES отмечает выполнено **Then** статус обновляется и событие попадает в ActivityEvent.
- **System shall** показывать просрочку, если `dueAt` &lt; now и статус не completed.

### FAQ quick access

- **Given** опубликованный FAQItem **When** SALES открывает панель **Then** видит категории и поиск.
- **When** нажата «вставить в ответ» **Then** текст копируется/вставляется в целевое поле без потери форматирования (минимум plain text).

### Content search

- **Given** медиа с тегом «сапфир» **When** MKT вводит запрос **Then** находит все релевантные assets по индексу (name, tags, sku).

### Media asset detail

- **Given** asset привязан к SKU **When** открыта деталь **Then** отображается список связанных `variantIds` / SKU.

### Product card / SKU

- **Given** SKU **When** открыта карточка **Then** видны металл, вставка, вес/размер (если есть), статус активности, ссылки на медиа.

### Inventory visibility

- **Given** SKU на двух локациях **When** SALES смотрит наличие **Then** видит агрегат или разбивку согласно контракту `InventorySummary` без редактирования.

### Import stubs (если заявлено в MVP)

- **System shall** не блокировать MVP при отсутствии интеграции: ручной CSV import за ADMIN **или** явный «не в MVP».

---

## 8. Frontend architecture draft (MVP)

**Рекомендация:** **Next.js (App Router)** + **TypeScript** + **React Query (TanStack Query)** для server state; **Zustand** или лёгкий context только для UI shell (sidebar, theme).

### 8.1 Структура приложения (предложение)

```text
app/
  (auth)/login/page.tsx
  (app)/layout.tsx                 # shell: sidebar, topbar
  (app)/dashboard/page.tsx
  (app)/sales/clients/page.tsx
  (app)/sales/clients/[id]/page.tsx
  (app)/content/page.tsx
  (app)/catalog/page.tsx
  (app)/faq/page.tsx
  (app)/inventory/page.tsx
  (app)/settings/users/page.tsx
 ...
components/
  ui/ # design system primitives
  shell/                           # Sidebar, Topbar, PageHeader
features/
  sales/                           # ClientList, ClientDetail, DealTabs, ReminderForm
  content/                         # AssetGrid, AssetDrawer, TagEditor
  dashboard/                       # KpiCards, Funnel, Charts
  catalog/                         # SkuDrawer, ProductTable
  admin/                           # UsersTable, RoleMatrix
lib/
  api/                             # fetch clients, typed
  auth/                            # session helpers
  permissions/                     # can(permissionCode)
  format/                          # money, dates
types/
  contracts/                       # DTO mirrors (generated or hand-written)
```

### 8.2 Границы состояния

- **Server state:** клиенты, сделки, медиа, каталог, остатки — только через API + кэш.
- **URL state:** фильтры списков (searchParams) для шаринга ссылок.
- **Ephemeral UI:** drawer/modal открытие — локально, кроме deep link `?assetId=`.

### 8.3 Сервисный слой

- `lib/api/*` — тонкие адаптеры: `getClient(id)`, `listMedia(query)`, без бизнес-логики.
- Ошибки API → унифицированные `ApiError` для toasts и форм.

### 8.4 Маршрутные группы

- `(auth)` — публичные страницы.
- `(app)` — защищённые layout с проверкой роли.

---

## 9. Backend architecture draft (MVP)

**Принцип:** монолит модулей (практично для MVP) с чёткими **bounded contexts** и последующей возможностью выделения сервисов.

### 9.1 Bounded contexts

1. **Identity & Access** — пользователи, роли, permissions, сессии, audit.
2. **CRM** — клиенты, сделки, заметки, напоминания, activity.
3. **Catalog** — продукты, SKU, атрибуты, цены (master).
4. **Inventory** — локации, остатки, резервы (если в scope).
5. **Media** — хранилище файлов + метаданные + связи SKU.
6. **Analytics** — агрегаты для дашборда (материализованные или nightly).

### 9.2 Модули (внутри монолита)

- `api/auth`, `api/users`, `api/clients`, `api/deals`, `api/notes`, `api/reminders`
- `api/products`, `api/inventory`, `api/media`, `api/faq`
- `api/dashboard` (read-only агрегаты)
- `workers/jobs` (опционально: пересчёт метрик)

### 9.3 Data ownership

- **CRM** владеет `Client`, `Deal`, `Note`, `Reminder`.
- **Catalog** владеет `Product`, `ProductVariant`.
- **Inventory** владеет `InventoryRecord`, `Location`, `Reservation`.
- **Media** владеет `MediaAsset` и связями (не дублирует цену/остаток — только FK).

### 9.4 Integration adapters (MVP = stubs)

- `adapters/crm_import` — интерфейс без реализации или CSV.
- `adapters/erp` (1C) — **Post-MVP**, контракт очереди событий.
- Webhooks / polling — зафиксировать позже.

### 9.5 Auth layer

- JWT + refresh **или** session cookie; обязательно **tenantId** в claims при multi-tenant.

### 9.6 Audit logging

- Запись: role change, user disable, deal status change, media delete, inventory adjust.

### 9.7 Dashboard aggregation

- Предрасчёт таблиц `dashboard_daily` или on-read с кэшем (Redis) — выбрать по нагрузке MVP.

---

## 10. Data contracts / DTO draft (проектный слой)

Типы условные (`string`, `uuid`, `iso8601`, `decimal`, `enum`).

### ClientSummary

| Field | Type | Req | Note |
|-------|------|-----|------|
| id | uuid | Yes | |
| fullName | string | Yes | |
| primaryPhone | string? | No | маскирование для OWNER по политике |
| status | enum | Yes | от сделки или клиента — унифицировать в PRD |
| lastActivityAt | iso8601 | No | |
| assignedToUserId | uuid? | No | |

### ClientDetail

| Field | Type | Req | Note |
|-------|------|-----|------|
| client | ClientSummary | Yes | |
| deals | DealSummary[] | Yes | |
| notes | Note[] | No | |
| reminders | Reminder[] | No | |
| timeline | ActivityEvent[] | Yes | |

### DealSummary

| Field | Type | Req | Note |
|-------|------|-----|------|
| id | uuid | Yes | |
| clientId | uuid | Yes | |
| status | enum | Yes | |
| primarySku | string? | No | |
| valueEstimate | decimal? | No | |
| updatedAt | iso8601 | Yes | |

### ProductSummary

| Field | Type | Req | Note |
|-------|------|-----|------|
| id | uuid | Yes | |
| name | string | Yes | |
| category | string | Yes | |
| activeVariantCount | int | Yes | |

### ProductDetail (SKU-centric view)

| Field | Type | Req | Note |
|-------|------|-----|------|
| product | ProductSummary | Yes | |
| variants | ProductVariantDTO[] | Yes | |
| media | MediaAssetSummary[] | No | |

### ProductVariantDTO

| Field | Type | Req | Note |
|-------|------|-----|------|
| id | uuid | Yes | |
| sku | string | Yes | unique |
| attrs | object | No | size, weight, stone |
| masterPrice | decimal? | No | скрыть/null для SALES по политике |
| status | enum | Yes | |

### InventorySummary (для SALES)

| Field | Type | Req | Note |
|-------|------|-----|------|
| variantId | uuid | Yes | |
| sku | string | Yes | |
| qtyAvailable | decimal/int | Yes | правило расчёта в API |
| qtyReserved | int | Yes | |
| locations | { locationId, qty }[] | No | |

### MediaAssetSummary

| Field | Type | Req | Note |
|-------|------|-----|------|
| id | uuid | Yes | |
| title | string | Yes | |
| type | enum | Yes | image, video, source |
| thumbUrl | string? | No | |
| skuTags | string[] | No | денорм для поиска |

### MediaAssetDetail

| Field | Type | Req | Note |
|-------|------|-----|------|
| asset | MediaAssetSummary | Yes | |
| channels | string[] | Yes | |
| linkedSkus | string[] | Yes | |
| downloadUrl | string? | No | по permission |

### DashboardSummary

| Field | Type | Req | Note |
|-------|------|-----|------|
| period | object | Yes | from/to |
| kpis | Record<string, number> | Yes | |
| funnel | { stage, count }[] | Yes | |
| managers | { userId, name, revenue, deals }[] | No | |
| alerts | { severity, message, ref }[] | No | P1 |

### FAQItemDTO

| Field | Type | Req | Note |
|-------|------|-----|------|
| id | uuid | Yes | |
| category | string | Yes | |
| question | string | Yes | |
| answer | string | Yes | |
| updatedAt | iso8601 | Yes | |

### UserAccessProfile

| Field | Type | Req | Note |
|-------|------|-----|------|
| user | { id, email, name } | Yes | |
| roles | string[] | Yes | codes |
| permissions | string[] | Yes | развёрнутые коды |

---

## 11. MVP vs Post-MVP boundary (жёстко)

### Входит в MVP (Foundation)

- Auth + RBAC + управление пользователями (ADMIN).
- Owner dashboard: KPI, воронка, тренд выручки, топ менеджеров, лента событий (базовая).
- Sales workspace: клиенты, сделка, статусы, заметки, next action, timeline, просмотр SKU и **видимости остатков** (read).
- Content center: загрузка, метаданные, теги/каналы, привязка к SKU, поиск.
- Catalog: продукт/SKU карточка, мастер-цена (с защитой прав).
- FAQ: просмотр + редактирование (MKT/ADMIN) + быстрый доступ из sales.
- Inventory: остатки по локациям, корректировка (STOCK), просмотр (SALES).
- Минимальный audit для критичных действий.
- Интеграции: **заглушки или CSV**, без обязательного 1C/Bitrix.

### Не входит в MVP

- Полноценный AI/LLM assistant, «генерация ответов», умные сводки.
- Полный production/MES, закупки SUPPLY, SLA цеха.
- Сложный DAM workflow (многостадийные согласования).
- Глобальный сквозной поиск по всем доменам.
- Маркетинговые кампании как сущность (beyond простой `source` на лиде).
- Мобильные приложения.

### Уходит в Operations Phase (Phase 2)

- Production orders, стадии цеха, ответственные цеха, комментарии производства.
- Расширенный резерв (правила, лимиты, автоснятие).
- Интеграция с 1C/ERP для **остатков и себестоимости**.
- Расширенные отчёты и выгрузки для финансов.

### Уходит в AI Layer (отдельный трек)

- AI summary для OWNER, персонализированные инсайты.
- Автоклассификация медиа, авто-теги, semantic search.
- Copilot для SALES (генерация follow-up).

### Откладывается без даты

- Полная multi-brand платформа, B2B портал, кастомные витрины, сложный прайс-лист по регионам.

---

## 12. Risks before build

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data chaos (несколько источников SKU) | Неверные остатки и медиа | Единый `sku` как ключ; запрет дублирования без merge-политики; старт с одного источника правды |
| Интеграции «обещаны заказчиком» | Растягивание MVP | Контракт адаптера + фаза 2; MVP на ручном CSV |
| Сложность прав резерва/цен | Конфликты ролей | Упростить P0: только STOCK подтверждает резерв; мастер-цена только ADMIN |
| Неопределённость статусов сделки | Несовместимость отчётов | Зафиксировать enum и маппинг на воронку до кодирования |
| PII / compliance | Юридические риски | Маскирование для OWNER; журнал доступа |
| UI overengineering | Срыв сроков | Повторить паттерн демо: list + drawer; один дизайн-системный слой |
| Underdefined catalog (SKU attrs) | Переделки модели | Начать с «гибких attrs JSON» + индекс по sku/name |
| Hidden Bitrix/1C logic | Невозможные SLA | Вынести в Phase 2; MVP без двустороннего sync |
| Performance без индексов | Медленный поиск | Полнотекст/отдельный search index для media/clients на P0/P1 |

---

## 13. Recommended next build order

1. **MOD-A:** Auth, tenant (если нужен), users, roles, permissions, защита маршрутов, минимальный audit.  
2. **MOD-E (read):** Product/SKU read API + страница каталога + SKU drawer (как в демо).  
3. **MOD-E + Inventory (read):** `InventorySummary` для SALES; базовые location + qty.  
4. **MOD-D:** Clients, deals, notes, reminders, timeline, статусы.  
5. **MOD-C:** Media upload, metadata, связь с SKU, поиск.  
6. **MOD-B:** Dashboard aggregates на реальных данных CRM/inventory.  
7. **MOD-C + MOD-D polish:** FAQ, deep links «из сделки в контент».  
8. **P1:** Reservation workflow, signals/alerts rules, export CSV, улучшение аудита.  
9. **Phase 2 backlog:** production, ERP adapters, AI layer.

---

## Приложение: соответствие демо-модулей и MOD-X

| Демо (текущее) | MOD | Комментарий |
|----------------|-----|-------------|
| `Sales.js`, `ClientCard.js`, `AIAssistant.js` | MOD-D (+ AI post) | AI вынести из MVP или заменить шаблонами |
| `ContentCenter.js`, `MediaGrid.js` | MOD-C | |
| `Dashboard.js`, `Charts.js`, `KPICards.js` | MOD-B | |
| `SkuDetail.js`, `skuCatalog.js` | MOD-E | |
| `FAQPanel.js`, `faq.js` | MOD-D + справочник | |
| `productionOrders.js` | **Phase 2 / SUPPLY** | не смешивать с MVP foundation |
| `router.js`, sidebar | MOD-A + shell | |

---

*Конец пакета. Рекомендуется синхронизировать с официальным PRD и зафиксировать enum статусов сделки и политику резерва одним приложением к этому документу.*
