import Link from "next/link";
import { channelsService, publishingService } from "@/lib/scale/services";
import { channelActivityActionRu } from "@/lib/i18n/ru-ui";

function wfRu(w: string) {
  const m: Record<string, string> = {
    draft: "черновик",
    ready: "готово",
    published: "опубликовано",
    needs_update: "обновить",
    paused: "пауза",
    archived: "архив",
  };
  return m[w] ?? w;
}

export default function PublicationsPage() {
  const matrix = publishingService.listMatrix();
  const activity = channelsService.allActivity(15);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Публикации</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Матрица SKU × канал, маршрут публикации и сигналы устаревания относительно
          операционного ядра.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <h2 className="font-medium">Недавняя активность каналов</h2>
        <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
          {activity.map((a) => (
            <li key={a.id}>
              {a.at} · {a.channelId} · {channelActivityActionRu(a.action)} · {a.detail}
 {a.sku ? ` · ${a.sku}` : ""}
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Канал</th>
              <th className="px-3 py-2">Маршрут</th>
              <th className="px-3 py-2">Чеклист</th>
              <th className="px-3 py-2">Сигналы</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => {
              const checklist = publishingService.publicationChecklist(row.listing);
              const okCount = checklist.filter((c) => c.ok).length;
              const signals = [
                ...row.listing.staleReasons,
                ...row.listing.issues,
              ];
              return (
                <tr key={row.id} className="border-b border-[var(--border)]">
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link
                      href={`/app/publications/${encodeURIComponent(row.id)}`}
                      className="hover:underline"
                    >
                      {row.sku}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs">{row.channelId}</td>
                  <td className="px-3 py-2 text-xs">{wfRu(row.listing.workflow)}</td>
                  <td className="px-3 py-2 text-xs">
                    {okCount}/{checklist.length}
                  </td>
                  <td className="px-3 py-2 text-xs text-[var(--muted)]">
                    {signals.join(" · ") || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
