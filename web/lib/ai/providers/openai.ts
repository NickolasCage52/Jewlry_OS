import type { CompletionInput } from "@/lib/ai/complete";
import type { AiCompletionResult } from "@/lib/ai/types";
import type { getAiRuntimeConfig } from "@/lib/ai/config";

export async function completeOpenAI(
  input: CompletionInput,
  cfg: ReturnType<typeof getAiRuntimeConfig>,
): Promise<AiCompletionResult> {
  if (!cfg.openaiApiKey) {
    throw new Error("openai_missing_key");
  }
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: cfg.openaiModel,
      temperature: 0.3,
      max_tokens: input.maxTokens ?? 900,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`openai_http_${res.status}: ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  return {
    text,
    meta: {
      provider: "openai",
      model: cfg.openaiModel,
      latencyMs: 0,
      usedFallback: false,
    },
  };
}
