import Link from "next/link";
import { notFound } from "next/navigation";
import { MEDIA_ASSETS } from "@/lib/mock/media-assets";
import { MediaClassifyPanel } from "@/components/ai/MediaClassifyPanel";
import { getAiFlagsForClient } from "@/lib/ai/public-flags";

export default async function ContentAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = MEDIA_ASSETS.find((m) => String(m.id) === id);
  if (!asset) notFound();
  const flags = getAiFlagsForClient();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/app/content" className="text-sm text-[var(--muted)] hover:underline">
        ← Контент
      </Link>
      <div>
        <h1 className="font-display text-2xl">{asset.name}</h1>
        <p className="font-mono text-sm text-[var(--muted)]">{asset.sku}</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm space-y-1">
        <p>Тип: {asset.type}</p>
        <p>Каналы: {asset.channel.join(", ")}</p>
        <p>
          {asset.metal} · {asset.stone} · {asset.category}
        </p>
      </div>
      <MediaClassifyPanel asset={asset} flags={flags} />
      <Link
        href={`/app/catalog/${encodeURIComponent(asset.sku)}`}
        className="text-sm underline"
      >
        Карточка SKU
      </Link>
    </div>
  );
}
