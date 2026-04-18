import type { AiFeatureKey, AiProviderName } from "@/lib/ai/types";

function envBool(name: string, defaultTrue: boolean): boolean {
  const v = process.env[name];
  if (v === undefined || v === "") return defaultTrue;
  return v === "1" || v.toLowerCase() === "true";
}

export function getAiProvider(): AiProviderName {
  const p = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  if (p === "openai" || p === "anthropic") return p;
  return "mock";
}

export function isAiFeatureEnabled(key: AiFeatureKey): boolean {
  const flags: Record<AiFeatureKey, string> = {
    search: "AI_SEARCH_ENABLED",
    copilot: "AI_COPILOT_ENABLED",
    ownerDigest: "AI_OWNER_DIGEST_ENABLED",
    generate: "AI_CONTENT_GENERATION_ENABLED",
    classify: "AI_CLASSIFICATION_ENABLED",
    recommend: "AI_RECOMMENDATIONS_ENABLED",
  };
  return envBool(flags[key], true);
}

export function getAiRuntimeConfig() {
  return {
    provider: getAiProvider(),
    timeoutMs: Math.min(
      Math.max(Number(process.env.AI_TIMEOUT_MS ?? 28000), 3000),
      120000,
    ),
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicModel:
      process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-20241022",
  };
}
