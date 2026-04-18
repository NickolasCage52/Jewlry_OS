import Link from "next/link";
import { channelsService } from "@/lib/scale/services";
import {
  channelReadinessRu,
  channelStatusRu,
  channelSyncRu,
} from "@/lib/i18n/ru-ui";

export default function ChannelsHubPage() {
  const channels = channelsService.list();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Внешние каналы</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Практичный слой каналов: статусы, готовность, публикации — без полноценной системы
          управления заказами для каждого маркетплейса.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {channels.map((c) => {
          const sum = channelsService.readinessSummary(c.id);
          return (
            <Link
              key={c.id}
              href={`/app/channels/${c.id}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--background)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{c.label}</div>
                <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--muted)]">
                  {channelStatusRu(c.status)}
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Готовность: {channelReadinessRu(c.readiness)} · синхр.:{" "}
                {channelSyncRu(c.syncState)}
              </p>
              {c.warnings.length > 0 ? (
                <p className="mt-2 text-xs text-amber-800">
                  {c.warnings[0]}
                  {c.warnings.length > 1 ? "…" : ""}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                <span>SKU: {sum.total}</span>
                <span>к публикации: {sum.publishable}</span>
                <span>внимание: {sum.needsAttention}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
