"use server";

import { roleHasPermission } from "@/lib/auth/access";
import { getSession } from "@/lib/auth/session";
import { isAiFeatureEnabled } from "@/lib/ai/config";
import { runCompletion } from "@/lib/ai/complete";
import { buildOwnerDigestContext } from "@/lib/ai/context/owner-snapshot";
import { buildSalesClientContext } from "@/lib/ai/context/sales-client-context";
import {
  SYSTEM_CONTENT_GEN,
  SYSTEM_OWNER_DIGEST,
  SYSTEM_SALES_COPILOT,
  SYSTEM_SEARCH_ASSIST,
} from "@/lib/ai/prompts/system";
import { runStructuredSearch } from "@/lib/ai/search/structured";
import { getCatalogProductOrStub } from "@/lib/mock/catalog-data";
import { getOpsStore } from "@/lib/ops/store";
import { computeEffectivePrice } from "@/lib/ops/pricing-engine";
import type { AiCompletionResult } from "@/lib/ai/types";

async function requireAiUser() {
  const session = await getSession();
  if (!session) throw new Error("unauthorized");
  if (!roleHasPermission(session.role, "ai:use")) throw new Error("forbidden");
  return session;
}

export async function aiRunStructuredSearch(query: string) {
  await requireAiUser();
  if (!isAiFeatureEnabled("search")) {
    return { ok: false as const, reason: "disabled" as const };
  }
  return { ok: true as const, data: runStructuredSearch(query) };
}

export async function aiSearchNarrative(
  query: string,
  structuredPayload: unknown,
): Promise<AiCompletionResult & { skipped?: boolean }> {
  await requireAiUser();
  if (!isAiFeatureEnabled("search")) {
    return {
      text: "AI-пояснения отключены флагом AI_SEARCH_ENABLED.",
      meta: { provider: "none", latencyMs: 0, usedFallback: true },
      skipped: true,
    };
  }
  const user = `Запрос: ${query}\n\nstructured_results:\n${JSON.stringify(structuredPayload, null, 2)}`;
  return runCompletion({
    system: SYSTEM_SEARCH_ASSIST,
    user,
    maxTokens: 700,
  });
}

export async function aiOwnerDigest(): Promise<
  AiCompletionResult & { skipped?: boolean }
> {
  const session = await requireAiUser();
  if (!roleHasPermission(session.role, "dashboard:view_owner")) {
    throw new Error("forbidden");
  }
  if (!isAiFeatureEnabled("ownerDigest")) {
    return {
      text: "Дайджест AI отключён (AI_OWNER_DIGEST_ENABLED).",
      meta: { provider: "none", latencyMs: 0, usedFallback: true },
      skipped: true,
    };
  }
  const ctx = buildOwnerDigestContext();
  return runCompletion({
    system: SYSTEM_OWNER_DIGEST,
    user: `Сформируй дайджест для собственника по данным:\n${ctx}`,
    maxTokens: 900,
  });
}

const COPILOT_INSTRUCTIONS: Record<string, string> = {
  summarize:
    "Кратко суммируй клиента и сделку для менеджера (5–7 буллетов). Только факты из JSON.",
  reply:
    "Предложи вежливый ответ клиенту в WhatsApp (2–4 коротких абзаца). Без обещаний не из данных.",
  followup:
    "Черновик follow-up сообщения: мягко напомнить о следующем шаге.",
  similar:
    "Как презентовать похожие SKU из similarSkus клиенту (2–3 предложения + почему уместно).",
  nudge: "Мягкий дожим без давления: 2 варианта формулировки.",
  compare:
    "Опиши, какие вопросы задать, чтобы сравнить с альтернативами (не выдумывая товары вне similarSkus).",
  budget:
    "Исходя из effective цены и статуса, предложи аргументы «мягко под бюджет» без обещания скидки, если скидки нет в данных.",
};

export type CopilotMode = keyof typeof COPILOT_INSTRUCTIONS;

export async function aiSalesCopilot(
  clientId: string,
  mode: CopilotMode,
): Promise<AiCompletionResult & { skipped?: boolean }> {
  const session = await requireAiUser();
  if (!roleHasPermission(session.role, "client:view")) {
    throw new Error("forbidden");
  }
  if (!isAiFeatureEnabled("copilot")) {
    return {
      text: "Копилот отключён (AI_COPILOT_ENABLED).",
      meta: { provider: "none", latencyMs: 0, usedFallback: true },
      skipped: true,
    };
  }
  const ctx = buildSalesClientContext(clientId);
  const hint = COPILOT_INSTRUCTIONS[mode] ?? COPILOT_INSTRUCTIONS.summarize;
  return runCompletion({
    system: SYSTEM_SALES_COPILOT,
    user: `${hint}\n\nКонтекст:\n${ctx}`,
    maxTokens: 800,
  });
}

export async function aiGenerateProductCopy(
  sku: string,
  channel: "avito" | "social" | "short" | "manager",
): Promise<AiCompletionResult & { skipped?: boolean }> {
  const session = await requireAiUser();
  if (!roleHasPermission(session.role, "product:view")) {
    throw new Error("forbidden");
  }
  if (!isAiFeatureEnabled("generate")) {
    return {
      text: "Генерация отключена (AI_CONTENT_GENERATION_ENABLED).",
      meta: { provider: "none", latencyMs: 0, usedFallback: true },
      skipped: true,
    };
  }
  const s = getOpsStore();
  const p = getCatalogProductOrStub(sku);
  const eff = computeEffectivePrice(s.prices[sku], p, s.promotions);
  const avito = s.avitoBySku[sku];
  const payload = {
    sku: p.sku,
    name: p.name,
    metal: p.metal,
    stone: p.stone,
    size: p.size,
    weight: p.weight,
    collection: p.collection,
    effectivePrice: eff.effective,
    promo: eff.activePromoName,
    avitoChecklist: avito?.checklist ?? [],
  };
  const channelHint: Record<typeof channel, string> = {
    avito: "Текст для Авито: структурируй заголовок + описание + призыв; без HTML; до 1200 символов.",
    social: "Короткий пост для соцсетей: 2–4 предложения + хэштеги умеренно.",
    short: "Одно короткое описание для карточки (3–5 предложений).",
    manager: "Внутренняя памятка для менеджера: факты и аргументы для разговора.",
  };
  return runCompletion({
    system: SYSTEM_CONTENT_GEN,
    user: `${channelHint[channel]}\n\nДанные:\n${JSON.stringify(payload, null, 2)}`,
    maxTokens: 900,
  });
}

export type MediaClassifySuggestion = {
  tags: string[];
  category: string;
  linkedSku: string | null;
  confidence: "high" | "medium" | "low";
  note: string;
};

/** Правила + опционально LLM; baseline всегда детерминирован. */
export async function aiSuggestMediaClassification(input: {
  name: string;
  sku: string;
  type: string;
}): Promise<{ ruleBased: MediaClassifySuggestion; aiText?: string; skipped?: boolean }> {
  const session = await requireAiUser();
  if (!roleHasPermission(session.role, "media:view")) {
    throw new Error("forbidden");
  }
  const tags: string[] = [];
  const n = input.name.toLowerCase();
  if (n.includes("сапфир")) tags.push("сапфир");
  if (n.includes("рубин")) tags.push("рубин");
  if (n.includes("изумруд")) tags.push("изумруд");
  if (n.includes("бриллиант")) tags.push("бриллиант");
  if (n.includes("видео") || input.type === "video") tags.push("видео");
  if (n.includes("фото") || input.type === "photo") tags.push("фото");
  if (tags.length === 0) tags.push("каталог");

  const ruleBased: MediaClassifySuggestion = {
    tags: [...new Set(tags)].slice(0, 8),
    category: n.includes("серьг")
      ? "Серьги"
      : n.includes("кольц")
        ? "Кольца"
        : n.includes("колье") || n.includes("кулон")
          ? "Колье/подвески"
          : "Прочее",
    linkedSku: input.sku || null,
    confidence: tags.length > 1 ? "medium" : "low",
    note: "Базовая классификация по ключевым словам. Проверьте перед публикацией.",
  };

  if (!isAiFeatureEnabled("classify")) {
    return { ruleBased, skipped: true };
  }

  const r = await runCompletion({
    system: SYSTEM_CONTENT_GEN,
    user: `Предложи до 5 тегов и одну категорию для медиа. Только JSON не нужен — 2 коротких предложения.\nВход: ${JSON.stringify(input)}`,
    maxTokens: 200,
  });

  return { ruleBased, aiText: r.text, skipped: false };
}
