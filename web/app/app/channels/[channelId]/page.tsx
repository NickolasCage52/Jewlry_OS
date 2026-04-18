import Link from "next/link";
import { notFound } from "next/navigation";
import { ContextualSops } from "@/components/scale/ContextualSops";
import { channelsService } from "@/lib/scale/services";
import type { ChannelId } from "@/lib/scale/types";
import {
  channelActivityActionRu,
  channelPublishingStateRu,
  channelReadinessRu,
  channelStatusRu,
  channelSyncRu,
  channelTypeRu,
} from "@/lib/i18n/ru-ui";

function wfLabel(w: string) {
  const map: Record<string, string> = {
    draft: "черновик",
    ready: "готово",
    published: "опубликовано",
    needs_update: "обновить",
    paused: "пауза",
    archived: "архив",
  };
  return map[w] ?? w;
}

export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId: raw } = await params;
  const channelId = raw as ChannelId;
  const meta = channelsService.get(channelId);
  if (!meta) notFound();

  const rows = channelsService.listingsForChannel(channelId);
  const activity = channelsService.activityForChannel(channelId);
  const sum = channelsService.readinessSummary(channelId);
  const publishableSkus = rows
    .filter(
      (r) =>
        r.listing.publishAllowed &&
        r.listing.issues.length === 0 &&
        r.listing.workflow !== "archived",
    )
    .map((r) => r.sku);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/app/channels" className="text-sm text-[var(--muted)] hover:underline">
          ← Каналы
        </Link>
        <h1 className="mt-2 font-display text-3xl">{meta.label}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Тип: {channelTypeRu(meta.type)} · статус: {channelStatusRu(meta.status)} ·
          готовность: {channelReadinessRu(meta.readiness)} · публикации:{" "}
          {channelPublishingStateRu(meta.publishingState)} · синхр.:{" "}
          {channelSyncRu(meta.syncState)} · обновлено {meta.lastUpdated}
        </p>
        {meta.warnings.length > 0 ? (
          <ul className="mt-2 list-inside list-disc text-sm text-amber-800">
            {meta.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <div className="text-xs text-[var(--muted)]">Всего SKU</div>
          <div className="text-2xl font-medium">{sum.total}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <div className="text-xs text-[var(--muted)]">К публикации</div>
          <div className="text-2xl font-medium">{sum.publishable}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <div className="text-xs text-[var(--muted)]">Блокеры</div>
          <div className="text-2xl font-medium">{sum.blocked}</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <div className="text-xs text-[var(--muted)]">Нужно внимание</div>
          <div className="text-2xl font-medium">{sum.needsAttention}</div>
        </div>
      </div>

      <ContextualSops surface="publication" />

      <div>
        <h2 className="text-sm font-medium">SKU к публикации</h2>
        <p className="mt-1 font-mono text-xs text-[var(--muted)]">
          {publishableSkus.length ? publishableSkus.join(", ") : "— пока нет полностью готовых"}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Товар</th>
              <th className="px-3 py-2">Этап</th>
              <th className="px-3 py-2">Готово</th>
              <th className="px-3 py-2">Почему не готово</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku} className="border-b border-[var(--border)]">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link
                    href={`/app/publications/${encodeURIComponent(`${r.sku}|${channelId}`)}`}
                    className="hover:underline"
                  >
                    {r.sku}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/app/catalog/${encodeURIComponent(r.sku)}`}
                    className="hover:underline"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-xs">{wfLabel(r.listing.workflow)}</td>
                <td className="px-3 py-2 text-xs">
                  {r.listing.publishAllowed && r.listing.issues.length === 0
                    ? "да"
                    : "нет"}
                </td>
                <td className="px-3 py-2 text-xs text-[var(--muted)]">
                  {[
                    ...r.listing.issues,
                    ...r.listing.staleReasons,
                  ].join(" · ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">Лента канала</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {activity.length === 0 ? (
            <li className="text-[var(--muted)]">Пока нет событий</li>
          ) : (
            activity.map((a) => (
              <li key={a.id} className="border-b border-[var(--border)] pb-2 last:border-0">
                <span className="text-xs text-[var(--muted)]">{a.at}</span> ·{" "}
                <span className="font-medium">{channelActivityActionRu(a.action)}</span> ·{" "}
                {a.detail}
                {a.sku ? (
                  <>
                    {" "}
                    ·{" "}
                    <Link
                      href={`/app/catalog/${encodeURIComponent(a.sku)}`}
                      className="font-mono text-xs hover:underline"
                    >
                      {a.sku}
                    </Link>
                  </>
                ) : null}
                <span className="text-xs text-[var(--muted)]"> · {a.actor}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
