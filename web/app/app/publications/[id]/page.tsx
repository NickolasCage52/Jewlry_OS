import Link from "next/link";
import { notFound } from "next/navigation";
import { roleHasPermission } from "@/lib/auth/access";
import { getSession } from "@/lib/auth/session";
import { PublicationWorkflowPanel } from "@/components/scale/PublicationWorkflowPanel";
import { ContextualSops } from "@/components/scale/ContextualSops";
import { channelsService } from "@/lib/scale/services";
import { publishingService } from "@/lib/scale/services";

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const id = decodeURIComponent(raw);
  const row = publishingService.getById(id);
  if (!row) notFound();

  const session = await getSession();
  const canManage =
    !!session && roleHasPermission(session.role, "channel:manage");

  const checklist = publishingService.publicationChecklist(
    row.listing,
    row.catalog?.statusLabel,
  );
  const checklistOk = checklist.every((c) => c.ok);
  const channelActivity = channelsService.activityForChannel(row.channelId).slice(0, 8);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/app/publications" className="text-sm text-[var(--muted)] hover:underline">
        ← Публикации
      </Link>
      <div>
        <h1 className="font-display text-3xl">
          {row.name}{" "}
          <span className="text-base font-normal text-[var(--muted)]">
            · {row.channelId}
          </span>
        </h1>
        <p className="font-mono text-sm text-[var(--muted)]">{row.sku}</p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <h2 className="font-medium">Чеклист готовности</h2>
        <ul className="mt-2 space-y-1">
          {checklist.map((c) => (
            <li key={c.key} className="flex gap-2 text-sm">
              <span>{c.ok ? "+" : "−"}</span>
              <span>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <PublicationWorkflowPanel
        sku={row.sku}
        channelId={row.channelId}
        workflow={row.listing.workflow}
        canManage={canManage}
        checklistOk={checklistOk}
      />

      <ContextualSops surface="publication" />

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <h2 className="font-medium">Лента по каналу</h2>
        <ul className="mt-2 space-y-2 text-xs">
          {channelActivity.map((a) => (
            <li key={a.id}>
              {a.at} · {a.action} · {a.detail}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={`/app/catalog/${encodeURIComponent(row.sku)}`}
        className="text-sm underline"
      >
        Карточка товара
      </Link>
    </div>
  );
}
