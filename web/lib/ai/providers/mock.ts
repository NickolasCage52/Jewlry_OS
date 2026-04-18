import type { CompletionInput } from "@/lib/ai/complete";
import type { AiCompletionResult } from "@/lib/ai/types";

/** Детерминированный demo-провайдер: не выдумывает факты, только форматирует переданный контекст. */
export async function completeMock(
  input: CompletionInput,
): Promise<AiCompletionResult> {
  const snippet = input.user.slice(0, 4000);
  const lines = [
    "[Режим mock / offline — ответ шаблонный, без внешней модели.]",
    "",
    "Кратко по переданному контексту:",
    snippet.split("\n").slice(0, 12).join("\n"),
    "",
    "Если нужен живой LLM, задайте AI_PROVIDER=openai|anthropic и ключи API.",
  ];
  return {
    text: lines.join("\n"),
    meta: { provider: "mock", model: "mock-v1", latencyMs: 0, usedFallback: false },
  };
}
