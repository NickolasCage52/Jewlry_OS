import type { AiFeatureKey } from "@/lib/ai/types";
import type { RoleCode } from "@/lib/types/session";

const ROLE_LABEL_RU: Record<RoleCode, string> = {
  OWNER: "Собственник",
  MKT: "Маркетинг",
  SALES: "Продажи",
  STOCK: "Склад",
  SUPPLY: "Снабжение",
  ADMIN: "Администратор",
};

export function roleLabelRu(role: RoleCode): string {
  return ROLE_LABEL_RU[role] ?? role;
}

/** Подпись роли в регламентах (включая «для всех»). */
export function sopRoleLabelRu(role: RoleCode | "all"): string {
  if (role === "all") return "Все роли";
  return roleLabelRu(role);
}

const LC_STAGE: Record<string, string> = {
  new: "Новый",
  active: "Активный",
  repeat: "Повторный",
  vip: "VIP / частый",
  dormant: "Спящий",
  reactivation_needed: "Нужна реактивация",
};

export function lifecycleStageRu(stage: string): string {
  return LC_STAGE[stage] ?? stage;
}

export function workflowPriorityRu(p: string): string {
  const m: Record<string, string> = {
    high: "Высокий",
    medium: "Средний",
    low: "Низкий",
  };
  return m[p] ?? p;
}

const AI_FEATURE: Record<AiFeatureKey, string> = {
  search: "Поиск",
  copilot: "Копилот",
  ownerDigest: "Сводка собственника",
  generate: "Генерация текстов",
  classify: "Классификация",
  recommend: "Рекомендации",
};

export function aiFeatureLabelRu(key: AiFeatureKey): string {
  return AI_FEATURE[key] ?? key;
}

export function aiProviderRu(p: string): string {
  const m: Record<string, string> = {
    mock: "демо",
    openai: "OpenAI",
    anthropic: "Anthropic",
    none: "нет",
  };
  return m[p] ?? p;
}

export function channelTypeRu(t: string): string {
  const m: Record<string, string> = {
    classified: "Доска объявлений",
    marketplace: "Маркетплейс",
    owned: "Свой канал",
    other: "Прочее",
  };
  return m[t] ?? t;
}

export function channelStatusRu(s: string): string {
  const m: Record<string, string> = {
    active: "Активен",
    paused: "Пауза",
    planned: "В планах",
  };
  return m[s] ?? s;
}

export function channelReadinessRu(r: string): string {
  const m: Record<string, string> = {
    healthy: "Норма",
    degraded: "Снижена",
    setup: "Настройка",
  };
  return m[r] ?? r;
}

export function channelSyncRu(s: string): string {
  const m: Record<string, string> = {
    manual: "Вручную",
    stub_sync: "Заглушка синхронизации",
    error: "Ошибка",
    ok_stub: "ОК (заглушка)",
  };
  return m[s] ?? s;
}

export function channelPublishingStateRu(s: string): string {
  const m: Record<string, string> = {
    partial: "Частично",
    ready: "Готово",
    blocked: "Заблокировано",
  };
  return m[s] ?? s;
}

export function integrationStatusRu(s: string): string {
  const m: Record<string, string> = {
    stub: "Заглушка",
    planned: "В планах",
    degraded: "Деградация",
    active: "Активна",
  };
  return m[s] ?? s;
}

export function promoStatusRu(s: string): string {
  const m: Record<string, string> = {
    draft: "Черновик",
    active: "Активна",
    ended: "Завершена",
  };
  return m[s] ?? s;
}

export function priceSourceRu(s: string): string {
  const m: Record<string, string> = {
    seed: "начальные данные",
    manual: "вручную",
    import_stub: "импорт (загл.)",
    erp_stub: "ERP (загл.)",
  };
  return m[s] ?? s;
}

export function promoScopeTypeRu(s: string): string {
  const m: Record<string, string> = {
    collection: "коллекция",
    sku: "SKU",
    category: "категория",
  };
  return m[s] ?? s;
}

export function promoDiscountTypeRu(s: string): string {
  const m: Record<string, string> = {
    percent: "%",
    fixed: "фикс",
    manual_override: "вручную",
  };
  return m[s] ?? s;
}

export function sopProcessAreaRu(area: string): string {
  const m: Record<string, string> = {
    sales: "Продажи",
    marketing: "Маркетинг",
    content: "Контент",
    stock: "Склад",
    supply: "Закупка",
    admin: "Админ",
    production: "Производство",
  };
  return m[area] ?? area;
}

export function sopDocStatusRu(s: string): string {
  const m: Record<string, string> = {
    active: "Активен",
    draft: "Черновик",
  };
  return m[s] ?? s;
}

export function channelActivityActionRu(a: string): string {
  const m: Record<string, string> = {
    published: "Опубликовано",
    updated: "Обновлено",
    needs_attention: "Нужно внимание",
    error: "Ошибка",
  };
  return m[a] ?? a;
}

export function avitoChannelStatusRu(s: string): string {
  const m: Record<string, string> = {
    off: "выкл.",
    ready: "готов",
    live_stub: "демо-эфир",
    blocked: "заблокирован",
  };
  return m[s] ?? s;
}

export function inventoryLocationKindRu(k: string): string {
  const m: Record<string, string> = {
    showroom: "шоурум",
    warehouse: "склад",
  };
  return m[k] ?? k;
}

export function faqCategoryRu(cat: string): string {
  const m: Record<string, string> = {
    care: "Уход",
    sizing: "Размер",
    custom: "Индивидуальный заказ",
    stones: "Камни",
    payment: "Доставка и оплата",
  };
  return m[cat] ?? cat;
}

export function publishWorkflowRu(w: string): string {
  const m: Record<string, string> = {
    draft: "черновик",
    ready: "готово",
    published: "опубликовано",
    needs_update: "обновить",
    paused: "пауза",
    archived: "архив",
  };
  return m[w] ?? w;
}

export function onboardingProgressStatusRu(s: string): string {
  const m: Record<string, string> = {
    pending: "не начат",
    started: "начат",
    in_progress: "в процессе",
    completed: "завершён",
  };
  return m[s] ?? s;
}

export function mediaAssetTypeRu(t: string): string {
  const m: Record<string, string> = {
    photo: "фото",
    video: "видео",
  };
  return m[t] ?? t;
}
