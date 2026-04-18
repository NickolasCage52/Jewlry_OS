import { CATALOG_BY_SKU } from "@/lib/mock/catalog-data";
import { clientKey, MOCK_CLIENTS } from "@/lib/mock/clients";
import { createId } from "@/lib/ops/id";
import type {
  ChannelActivityEvent,
  ChannelId,
  ClientLifecycleProfile,
  ExternalChannel,
  IntegrationStub,
  OnboardingTrack,
  ProductionOrderLite,
  ScaleState,
  SkuChannelListing,
  SopDocument,
  UserOnboardingProgress,
  WorkflowTask,
} from "@/lib/scale/types";
import type { PublishWorkflowState } from "@/lib/scale/types";

const SEED_TIME = "2026-04-17T12:00:00.000Z";

const CHANNEL_DEFS: ExternalChannel[] = [
  {
    id: "avito",
    label: "Avito",
    type: "classified",
    status: "active",
    readiness: "healthy",
    publishingState: "partial",
    syncState: "manual",
    lastUpdated: SEED_TIME,
    warnings: [],
  },
  {
    id: "ozon",
    label: "Ozon",
    type: "marketplace",
    status: "active",
    readiness: "degraded",
    publishingState: "partial",
    syncState: "stub_sync",
    lastUpdated: "2026-04-16T18:30:00.000Z",
    warnings: ["Нет live API — режим ручной выгрузки"],
  },
  {
    id: "wildberries",
    label: "Wildberries",
    type: "marketplace",
    status: "planned",
    readiness: "setup",
    publishingState: "blocked",
    syncState: "stub_sync",
    lastUpdated: "2026-04-10T09:00:00.000Z",
    warnings: ["Кабинет в подключении", "Требуется юр. проверка карточек"],
  },
  {
    id: "website",
    label: "Сайт / витрина",
    type: "owned",
    status: "active",
    readiness: "healthy",
    publishingState: "ready",
    syncState: "ok_stub",
    lastUpdated: "2026-04-17T08:00:00.000Z",
    warnings: [],
  },
  {
    id: "future_stub",
    label: "Будущий канал (stub)",
    type: "other",
    status: "paused",
    readiness: "setup",
    publishingState: "blocked",
    syncState: "manual",
    lastUpdated: "2026-03-01T00:00:00.000Z",
    warnings: ["Зарезервировано под новый маркетплейс"],
  },
];

function hasStock(sku: string): boolean {
  const p = CATALOG_BY_SKU[sku];
  if (!p) return false;
  return (
    p.availability.showroom + p.availability.warehouse > 0 ||
    p.availability.madeToOrder
  );
}

function buildListing(
  sku: string,
  channelId: ChannelId,
): SkuChannelListing {
  const p = CATALOG_BY_SKU[sku];
  const priceOk = !!p?.price && p.price > 0;
  const stockOk = hasStock(sku);
  const photosOk = !["ERR-1923", "PND-0892"].includes(sku);
  const descOk = sku !== "RNG-3001";
  const categoryOk =
    channelId === "wildberries"
      ? !!(p?.collection && p.collection.length > 2)
      : true;

  let hasContent = photosOk;
  let hasDescription = descOk;
  if (channelId === "ozon") {
    hasContent = photosOk && descOk;
    hasDescription = descOk;
  }
  if (channelId === "website") {
    hasContent = photosOk && descOk;
    hasDescription = descOk;
  }
  if (channelId === "wildberries") {
    hasContent = photosOk && categoryOk;
    hasDescription = descOk;
  }
  if (channelId === "future_stub") {
    hasContent = false;
    hasDescription = false;
  }

  const hasPrice = priceOk;
  const enabled = channelId !== "future_stub";
  const publishAllowed =
    enabled &&
    hasPrice &&
    hasStock(sku) &&
    hasDescription &&
    categoryOk &&
    p?.statusLabel !== "Архив";

  const issues: string[] = [];
  if (!hasPrice) issues.push("Нет цены");
  if (!stockOk) issues.push("Нет доступного остатка / под заказ");
  if (!photosOk) issues.push("Недостаточно медиа");
  if (!descOk) issues.push("Описание не заполнено");
  if (!categoryOk) issues.push("Категория WB");

  const readyToPublish = publishAllowed && hasContent && issues.length === 0;

  let workflow: PublishWorkflowState = "draft";
  if (channelId === "website" && readyToPublish) {
    workflow = sku === "ERR-2201" ? "paused" : "published";
  } else if (channelId === "avito" && readyToPublish) {
    workflow = ["RNG-2847", "PND-0391"].includes(sku) ? "published" : "ready";
  } else if (readyToPublish) {
    workflow = "ready";
  } else {
    workflow = "draft";
  }

  const published = workflow === "published";
  const lastPublishedAt =
    published && channelId === "website"
      ? "2026-04-16T14:00:00.000Z"
      : published && channelId === "avito" && ["RNG-2847", "PND-0391"].includes(sku)
        ? "2026-04-15T11:00:00.000Z"
        : undefined;

  return {
    sku,
    channelId,
    enabled,
    hasContent,
    hasPrice,
    hasDescription,
    categoryOk,
    publishAllowed,
    workflow,
    published,
    lastPublishedAt,
    staleReasons: [],
    issues,
  };
}

function seedSkuChannel(): ScaleState["skuChannel"] {
  const out: ScaleState["skuChannel"] = {};
  const chans: ChannelId[] = [
    "avito",
    "ozon",
    "wildberries",
    "website",
    "future_stub",
  ];
  for (const sku of Object.keys(CATALOG_BY_SKU)) {
    out[sku] = {};
    for (const c of chans) {
      out[sku][c] = buildListing(sku, c);
    }
  }
  return out;
}

function seedSops(): SopDocument[] {
  return [
    {
      id: "sop-sales-first-touch",
      title: "Первый контакт с лидом",
      role: "SALES",
      processArea: "sales",
      version: "1.1",
      status: "active",
      updatedBy: "А. Иванова",
      updatedAt: "2026-04-12T10:00:00.000Z",
      owner: "Руководитель продаж",
      surfaces: ["client_card", "workflow"],
      steps: [
        "Зафиксировать канал и запрос",
        "Проверить наличие / срок по SKU",
        "Отправить медиа и КП в течение 2 ч",
        "Поставить напоминание в CRM",
      ],
    },
    {
      id: "sop-avito-card",
      title: "Чеклист карточки Avito",
      role: "MKT",
      processArea: "marketing",
      version: "2.0",
      status: "active",
      updatedBy: "П. Волкова",
      updatedAt: "2026-04-14T16:00:00.000Z",
      owner: "Маркетинг",
      surfaces: ["publication", "product"],
      steps: [
        "3+ фото, главное — на модели",
        "Цена с учётом акций",
        "Статус «в наличии» / «под заказ»",
        "Юридический блок и проба",
      ],
    },
    {
      id: "sop-content-asset",
      title: "Загрузка и теги медиа",
      role: "MKT",
      processArea: "content",
      version: "1.0",
      status: "active",
      updatedBy: "П. Волкова",
      updatedAt: "2026-04-01T09:00:00.000Z",
      owner: "Контент",
      surfaces: ["product", "workflow"],
      steps: [
        "Проверить SKU и коллекцию",
        "Добавить ракурсы и макро",
        "Проставить теги и alt-тексты",
      ],
    },
    {
      id: "sop-stock-adjust",
      title: "Корректировка остатков",
      role: "STOCK",
      processArea: "stock",
      version: "1.2",
      status: "active",
      updatedBy: "К. Орлов",
      updatedAt: "2026-04-11T11:00:00.000Z",
      owner: "Склад",
      surfaces: ["product", "workflow"],
      steps: [
        "Сверить физический остаток",
        "Обновить локации",
        "Отметить резервы",
        "Уведомить продажи при критике",
      ],
    },
    {
      id: "sop-procurement-stone",
      title: "Приёмка камней",
      role: "SUPPLY",
      processArea: "supply",
      version: "1.0",
      status: "active",
      updatedBy: "М. Лебедева",
      updatedAt: "2026-04-09T14:00:00.000Z",
      owner: "Закупки",
      surfaces: ["procurement", "workflow"],
      steps: [
        "Сверить сертификат и вес",
        "Внести в реестр камней",
        "Привязать к заказу / категории",
      ],
    },
    {
      id: "sop-admin-users",
      title: "Выдача доступов сотруднику",
      role: "ADMIN",
      processArea: "admin",
      version: "1.0",
      status: "active",
      updatedBy: "Система",
      updatedAt: "2026-04-17T08:00:00.000Z",
      owner: "Администратор",
      surfaces: ["workflow"],
      steps: [
        "Создать пользователя и роль",
        "Проверить модули по матрице",
        "Отправить ссылку на онбординг",
      ],
    },
    {
      id: "sop-production-handoff",
      title: "Передача заказа в цех",
      role: "all",
      processArea: "production",
      version: "0.9",
      status: "draft",
      updatedBy: "Мастерская",
      updatedAt: "2026-04-05T18:00:00.000Z",
      owner: "Производство",
      surfaces: ["workflow", "product"],
      steps: [
        "Проверить комплектность ТЗ",
        "Назначить ответственного мастера",
        "Промежуточные фото по этапам",
      ],
    },
  ];
}

function seedOnboarding(): OnboardingTrack[] {
  const item = (
    id: string,
    label: string,
    href?: string,
    sopId?: string,
  ) => ({ id, label, href, sopId });
  return [
    {
      role: "SALES",
      title: "Продажи — первые шаги",
      items: [
        item("s1", "Открыть воронку и лиды", "/app/sales"),
        item("s2", "Прочитать регламент первого контакта", undefined, "sop-sales-first-touch"),
        item("s3", "Проверить резервы и цены", "/app/stock"),
        item("s4", "Познакомиться с AI-поиском", "/app/search"),
      ],
    },
    {
      role: "MKT",
      title: "Маркетинг и контент",
      items: [
        item("m1", "Каналы и статусы", "/app/channels"),
        item("m2", "Матрица публикаций", "/app/publications"),
        item("m3", "Регламент карточки Avito", undefined, "sop-avito-card"),
        item("m4", "Медиатека", "/app/content"),
      ],
    },
    {
      role: "STOCK",
      title: "Склад",
      items: [
        item("t1", "Обзор остатков", "/app/stock"),
        item("t2", "Регламент корректировки остатков", undefined, "sop-stock-adjust"),
        item("t3", "Производственные заказы", "/app/operations/orders"),
      ],
    },
    {
      role: "SUPPLY",
      title: "Закупки",
      items: [
        item("u1", "Реестр закупок", "/app/procurement"),
        item("u2", "Регламент приёмки камней", undefined, "sop-procurement-stone"),
        item("u3", "Курсы и валюта", "/app/pricing"),
      ],
    },
    {
      role: "ADMIN",
      title: "Администрирование",
      items: [
        item("a1", "Пользователи и роли", "/app/settings/users"),
        item("a2", "Регламент выдачи доступов", undefined, "sop-admin-users"),
        item("a3", "Здоровье системы", "/app/admin/system"),
      ],
    },
    {
      role: "OWNER",
      title: "Собственник",
      items: [
        item("o1", "Дашборд", "/app/dashboard"),
        item("o2", "Жизненный цикл клиентов", "/app/lifecycle"),
        item("o3", "Админ-панель", "/app/admin/system"),
        item("o4", "Каналы", "/app/channels"),
      ],
    },
  ];
}

function seedLifecycle(): Record<string, ClientLifecycleProfile> {
  const map: Record<string, ClientLifecycleProfile> = {};
  for (const c of MOCK_CLIENTS) {
    const k = clientKey(c.id);
    if (c.id === 1) {
      map[k] = {
        clientKey: k,
        lifecycle: "vip",
        visitsApprox: 14,
        ordersApprox: 6,
        lifetimeValueRub: 420000,
        lastContactDaysAgo: 12,
        segmentNote: "Повторные покупки, рекомендации",
        careTriggers: [
          "Поздравить с годовщиной покупки",
          "Персональное предложение по коллекции Royal Blue",
        ],
      };
    } else if (c.id === 2) {
      map[k] = {
        clientKey: k,
        lifecycle: "new",
        visitsApprox: 1,
        ordersApprox: 0,
        lifetimeValueRub: 0,
        lastContactDaysAgo: 0,
        segmentNote: "Лид с Avito",
        careTriggers: ["Напомнить через 24 ч", "Предложить видео осмотра"],
      };
    } else {
      map[k] = {
        clientKey: k,
        lifecycle: "active",
        visitsApprox: 4,
        ordersApprox: 1,
        lifetimeValueRub: 89000,
        lastContactDaysAgo: 3,
        segmentNote: "Ждёт решения по браслету",
        careTriggers: ["Напомнить о резерве", "Апселл сервиса"],
      };
    }
  }
  return map;
}

function seedWorkflowTasks(): WorkflowTask[] {
  return [
    {
      id: "wf-1",
      title: "Обновить карточки Ozon после изменения цен",
      area: "channels",
      priority: "high",
      createdAt: "2026-04-17T09:10:00.000Z",
      assigneeRole: "MKT",
      href: "/app/publications",
      reason: "Базовая цена изменена у 3 SKU",
      source: "pricing_changed",
    },
    {
      id: "wf-2",
      title: "Проверить резерв BRC-5512",
      area: "inventory",
      priority: "medium",
      createdAt: "2026-04-14T10:05:00.000Z",
      assigneeRole: "SALES",
      href: "/app/stock/BRC-5512",
      reason: "Активный резерв клиенту",
      source: "reservation_created",
    },
    {
      id: "wf-3",
      title: "Дозаказ изумрудов — низкий остаток",
      area: "supply",
      priority: "medium",
      createdAt: "2026-04-16T07:00:00.000Z",
      assigneeRole: "SUPPLY",
      href: "/app/procurement",
      reason: "Сигнал низкого остатка по категории «кулоны»",
      source: "low_stock",
    },
    {
      id: "wf-4",
      title: "Доработать медиа для ERR-1923",
      area: "content",
      priority: "high",
      createdAt: "2026-04-15T12:00:00.000Z",
      assigneeRole: "MKT",
      href: "/app/catalog/ERR-1923",
      reason: "Публикация не готова — нет фото",
      source: "publication_blocked",
    },
  ];
}

function seedProduction(): ProductionOrderLite[] {
  return [
    {
      id: "po-1001",
      sku: "RNG-3001",
      productName: "Кольцо под заказ",
      clientName: "Мария Соколова",
      stage: "waiting_stone",
      ownerName: "М. Петрова",
      responsible: "supply",
      dueAt: "2026-04-22",
      stuck: true,
      delayReason: "Ожидание камня от поставщика",
    },
    {
      id: "po-1002",
      sku: "WED-0088",
      productName: "Обручальные кольца",
      clientName: "А. и Д. Ким",
      stage: "assembly",
      ownerName: "Цех №1",
      responsible: "workshop",
      dueAt: "2026-04-19",
      stuck: false,
    },
    {
      id: "po-1003",
      sku: "BRC-4401",
      productName: "Браслет на заказ",
      clientName: "Елена Власова",
      stage: "finishing",
      ownerName: "Цех №2",
      responsible: "workshop",
      dueAt: "2026-04-18",
      stuck: false,
    },
    {
      id: "po-1004",
      sku: "PND-0892",
      productName: "Кулон редизайн",
      clientName: "Александр Петров",
      stage: "new_order",
      ownerName: "М. Петрова",
      responsible: "manager",
      dueAt: "2026-04-25",
      stuck: false,
    },
  ];
}

function seedActivity(): ChannelActivityEvent[] {
  return [
    {
      id: "ca-1",
      at: "2026-04-15T11:00:00.000Z",
      channelId: "avito",
      sku: "RNG-2847",
      action: "published",
      detail: "Карточка выгружена (stub)",
      actor: "П. Волкова",
    },
    {
      id: "ca-2",
      at: "2026-04-16T14:00:00.000Z",
      channelId: "website",
      sku: "RNG-2847",
      action: "updated",
      detail: "Обновлены фото",
      actor: "П. Волкова",
    },
    {
      id: "ca-3",
      at: "2026-04-14T09:00:00.000Z",
      channelId: "ozon",
      sku: "PND-0391",
      action: "needs_attention",
      detail: "Категория на модерации",
      actor: "Система",
    },
    {
      id: "ca-4",
      at: "2026-04-13T16:20:00.000Z",
      channelId: "wildberries",
      action: "error",
      detail: "Нет баркода — выгрузка отклонена (stub)",
      actor: "Система",
    },
  ];
}

function seedIntegrations(): IntegrationStub[] {
  return [
    {
      id: "int-avito",
      name: "Avito API",
      status: "planned",
      lastCheck: SEED_TIME,
      detail: "OAuth и каталог — в очереди",
    },
    {
      id: "int-ozon",
      name: "Ozon Seller API",
      status: "stub",
      lastCheck: SEED_TIME,
      detail: "Адаптер-заглушка, ручной JSON",
    },
    {
      id: "int-openai",
      name: "AI провайдер",
      status: "stub",
      lastCheck: SEED_TIME,
      detail: "Зависит от ключа в .env",
    },
  ];
}

function buildInitial(): ScaleState {
  return {
    channels: CHANNEL_DEFS,
    skuChannel: seedSkuChannel(),
    channelActivity: seedActivity(),
    sops: seedSops(),
    onboardingTracks: seedOnboarding(),
    onboardingProgress: {},
    sopReadByUser: {},
    clientLifecycle: seedLifecycle(),
    workflowTasks: seedWorkflowTasks(),
    productionOrders: seedProduction(),
    integrations: seedIntegrations(),
  };
}

declare global {
  var __jbosScaleStore: ScaleState | undefined;
}

export function getScaleStore(): ScaleState {
  if (!globalThis.__jbosScaleStore) {
    globalThis.__jbosScaleStore = buildInitial();
  }
  return globalThis.__jbosScaleStore;
}

export function appendChannelActivity(
  ev: Omit<ChannelActivityEvent, "id" | "at"> & { at?: string },
) {
  const s = getScaleStore();
  s.channelActivity.unshift({
    id: createId("chact"),
    at: ev.at ?? new Date().toISOString(),
    channelId: ev.channelId,
    sku: ev.sku,
    action: ev.action,
    detail: ev.detail,
    actor: ev.actor,
  });
}

export function setSkuChannelWorkflow(
  sku: string,
  channelId: ChannelId,
  workflow: PublishWorkflowState,
  actor: string,
) {
  const s = getScaleStore();
  const row = s.skuChannel[sku]?.[channelId];
  if (!row) return;
  row.workflow = workflow;
  row.published = workflow === "published";
  if (workflow === "published") {
    row.lastPublishedAt = new Date().toISOString();
    row.staleReasons = [];
  }
  if (workflow === "archived" || workflow === "paused") {
    row.published = false;
  }
  const action: ChannelActivityEvent["action"] =
    workflow === "published"
      ? "published"
      : workflow === "needs_update"
        ? "needs_attention"
        : workflow === "draft" || workflow === "archived"
          ? "unpublished"
          : "updated";
  appendChannelActivity({
    channelId,
    sku,
    action,
    detail: `workflow → ${workflow}`,
    actor,
  });
}

export function markSopRead(userId: string, sopId: string, read: boolean) {
  const s = getScaleStore();
  const prev = new Set(s.sopReadByUser[userId] ?? []);
  if (read) prev.add(sopId);
  else prev.delete(sopId);
  s.sopReadByUser[userId] = [...prev];
}

function onboardingProgressKey(
  userId: string,
  role: import("@/lib/types/session").RoleCode,
) {
  return `${userId}:${role}`;
}

export function markOnboardingItem(
  userId: string,
  role: import("@/lib/types/session").RoleCode,
  itemId: string,
  completed: boolean,
) {
  const s = getScaleStore();
  const now = new Date().toISOString();
  const pk = onboardingProgressKey(userId, role);
  const prev =
    s.onboardingProgress[pk] ??
    ({
      userId,
      role,
      completedItemIds: [],
      startedAt: now,
      updatedAt: now,
    } as UserOnboardingProgress);
  const set = new Set(prev.completedItemIds);
  if (completed) set.add(itemId);
  else set.delete(itemId);
  s.onboardingProgress[pk] = {
    ...prev,
    role,
    completedItemIds: [...set],
    updatedAt: now,
  };
}
