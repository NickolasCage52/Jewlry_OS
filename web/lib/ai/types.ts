export type AiProviderName = "mock" | "openai" | "anthropic";

export type AiCompletionMeta = {
  provider: AiProviderName | "none";
  model?: string;
  latencyMs: number;
  usedFallback: boolean;
};

export type AiCompletionResult = {
  text: string;
  meta: AiCompletionMeta;
  error?: string;
};

export type AiFeatureKey =
  | "search"
  | "copilot"
  | "ownerDigest"
  | "generate"
  | "classify"
  | "recommend";
