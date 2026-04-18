import type { CompletionInput } from "@/lib/ai/complete";
import type { AiCompletionResult } from "@/lib/ai/types";
import type { getAiRuntimeConfig } from "@/lib/ai/config";

export async function completeAnthropic(
  input: CompletionInput,
  cfg: ReturnType<typeof getAiRuntimeConfig>,
): Promise<AiCompletionResult> {
  if (!cfg.anthropicApiKey) {
    throw new Error("anthropic_missing_key");
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": cfg.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: cfg.anthropicModel,
      max_tokens: input.maxTokens ?? 900,
      temperature: 0.3,
      system: input.system,
      messages: [{ role: "user", content: input.user }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`anthropic_http_${res.status}: ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text =
    data.content?.map((b) => (b.type === "text" ? b.text : "")).join("") ?? "";
  return {
    text: text.trim(),
    meta: {
      provider: "anthropic",
      model: cfg.anthropicModel,
      latencyMs: 0,
      usedFallback: false,
    },
  };
}
