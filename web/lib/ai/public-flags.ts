import { getAiProvider, isAiFeatureEnabled } from "@/lib/ai/config";

export type AiClientFlags = {
  provider: string;
  search: boolean;
  copilot: boolean;
  ownerDigest: boolean;
  generate: boolean;
  classify: boolean;
  recommend: boolean;
};

export function getAiFlagsForClient(): AiClientFlags {
  return {
    provider: getAiProvider(),
    search: isAiFeatureEnabled("search"),
    copilot: isAiFeatureEnabled("copilot"),
    ownerDigest: isAiFeatureEnabled("ownerDigest"),
    generate: isAiFeatureEnabled("generate"),
    classify: isAiFeatureEnabled("classify"),
    recommend: isAiFeatureEnabled("recommend"),
  };
}
