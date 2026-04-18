import { getAiRuntimeConfig, getAiProvider } from "@/lib/ai/config";
import type { AiCompletionResult, AiProviderName } from "@/lib/ai/types";
import { logAiEvent } from "@/lib/ai/telemetry";
import { completeAnthropic } from "@/lib/ai/providers/anthropic";
import { completeMock } from "@/lib/ai/providers/mock";
import { completeOpenAI } from "@/lib/ai/providers/openai";

export type CompletionInput = {
  system: string;
  user: string;
  maxTokens?: number;
};

export async function runCompletion(input: CompletionInput): Promise<AiCompletionResult> {
  const cfg = getAiRuntimeConfig();
  const preferred = getAiProvider();
  const order = providerFallbackOrder(preferred);
  const started = Date.now();
  let lastErr: string | undefined;

  for (const provider of order) {
    try {
      const r = await withTimeout(
        dispatch(provider, input, cfg),
        cfg.timeoutMs,
      );
      logAiEvent("completion_ok", {
        provider,
        ms: Date.now() - started,
        usedFallback: provider !== preferred,
      });
      return {
        ...r,
        meta: {
          ...r.meta,
          latencyMs: Date.now() - started,
          usedFallback: provider !== preferred,
        },
      };
    } catch (e) {
      lastErr = e instanceof Error ? e.message : "unknown_error";
      logAiEvent("completion_fail", { provider, error: lastErr });
    }
  }

  return {
    text:
      "AI временно недоступен. Используйте обычный поиск и карточки вручную. " +
      (lastErr ? `(${lastErr})` : ""),
    meta: {
      provider: "none",
      latencyMs: Date.now() - started,
      usedFallback: true,
    },
    error: lastErr,
  };
}

function providerFallbackOrder(primary: AiProviderName): AiProviderName[] {
  if (primary === "mock") return ["mock"];
  return [primary, "mock"];
}

async function dispatch(
  provider: AiProviderName,
  input: CompletionInput,
  cfg: ReturnType<typeof getAiRuntimeConfig>,
): Promise<AiCompletionResult> {
  switch (provider) {
    case "openai":
      return completeOpenAI(input, cfg);
    case "anthropic":
      return completeAnthropic(input, cfg);
    default:
      return completeMock(input);
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("ai_timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}
