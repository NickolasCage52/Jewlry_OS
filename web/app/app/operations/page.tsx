import Link from "next/link";
import { ContextualSops } from "@/components/scale/ContextualSops";
import { operationsOrdersService, workflowService } from "@/lib/scale/services";
import { workflowPriorityRu } from "@/lib/i18n/ru-ui";

export default function OperationsHubPage() {
  const tasks = workflowService.list();
  const stuck = operationsOrdersService.stuck();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Операции и сигналы</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Лёгкий сценарный слой: что произошло, почему, что делать дальше.
        </p>
      </div>
      <Link
        href="/app/operations/orders"
        className="inline-block rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium hover:bg-[var(--background)]"
      >
        Производственные заказы →
      </Link>
      {stuck.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <h2 className="font-medium">Зависшие заказы</h2>
          <ul className="mt-2 space-y-1 text-xs">
            {stuck.map((o) => (
              <li key={o.id}>
                {o.id} · {o.clientName} · {o.stage} — {o.delayReason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ContextualSops surface="workflow" title="Регламенты и операционные шаги" />
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">Задачи и последствия</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {tasks.map((t) => (
            <li key={t.id} className="border-b border-[var(--border)] pb-3 last:border-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{t.title}</span>
                <span className="text-xs text-[var(--muted)]">
                  {workflowPriorityRu(t.priority)}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">{t.reason}</p>
              <p className="mt-1 text-xs">Источник: {t.source}</p>
              {t.href ? (
                <Link href={t.href} className="mt-2 inline-block text-xs underline">
                  Перейти
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
