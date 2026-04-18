import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SopReadToggle } from "@/components/scale/SopReadToggle";
import { sopService } from "@/lib/scale/services";
import { sopDocStatusRu, sopProcessAreaRu, sopRoleLabelRu } from "@/lib/i18n/ru-ui";

export default async function SopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sop = sopService.get(id);
  if (!sop) notFound();
  const session = await getSession();
  const read = session ? sopService.isRead(session.id, sop.id) : false;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/app/sop" className="text-sm text-[var(--muted)] hover:underline">
        ← Библиотека регламентов
      </Link>
      <div>
        <h1 className="font-display text-3xl">{sop.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Область: {sopProcessAreaRu(sop.processArea)} · роль: {sopRoleLabelRu(sop.role)} ·
          v{sop.version} · {sopDocStatusRu(sop.status)}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Владелец: {sop.owner} · обновлено {sop.updatedAt} · {sop.updatedBy}
        </p>
      </div>
      <ol className="list-decimal space-y-3 pl-5 text-sm">
        {sop.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      {session ? (
        <SopReadToggle sopId={sop.id} read={read} />
      ) : null}
    </div>
  );
}
