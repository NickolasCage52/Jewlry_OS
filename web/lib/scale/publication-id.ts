import type { ChannelId } from "@/lib/scale/types";

const SEP = "|";

export function encodePublicationId(sku: string, channelId: ChannelId): string {
  return `${sku}${SEP}${channelId}`;
}

export function decodePublicationId(
  id: string,
): { sku: string; channelId: ChannelId } | null {
  const i = id.lastIndexOf(SEP);
  if (i <= 0) return null;
  const sku = id.slice(0, i);
  const channelId = id.slice(i + 1) as ChannelId;
  if (!sku || !channelId) return null;
  return { sku, channelId };
}
