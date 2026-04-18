"use client";

import { setPublicationWorkflow } from "@/lib/scale/actions";
import type { ChannelId, PublishWorkflowState } from "@/lib/scale/types";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const STEPS: { key: PublishWorkflowState; label: string }[] = [
  { key: "draft", label: "Черновик" },
  { key: "ready", label: "Готово" },
  { key: "published", label: "Опубликовано" },
  { key: "needs_update", label: "Нужно обновить" },
  { key: "paused", label: "Пауза" },
  { key: "archived", label: "Архив" },
];

export function PublicationWorkflowPanel({
  sku,
  channelId,
  workflow,
  canManage,
  checklistOk,
}: {
  sku: string;
  channelId: ChannelId;
  workflow: PublishWorkflowState;
  canManage: boolean;
  checklistOk: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(next: PublishWorkflowState) {
    start(async () => {
      await setPublicationWorkflow(sku, channelId, next);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
      <h2 className="font-medium">Маршрут публикации</h2>
      <div className="mt-3 flex flex-wrap gap-1 text-xs">
        {STEPS.map((s) => (
          <span
            key={s.key}
            className={`rounded-full px-2 py-0.5 ${
              s.key === workflow
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "bg-[var(--background)] text-[var(--muted)]"
            }`}
          >
            {s.label}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Поток: подготовить → проверить → опубликовать (экспорт) → при изменениях в ядре —
        обновить или снять.
      </p>
      {canManage ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={
              pending || workflow === "ready" || workflow === "published"
            }
            onClick={() => run("ready")}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--background)] disabled:opacity-40"
          >
            Отметить готовым
          </button>
          <button
            type="button"
            disabled={pending || !checklistOk || workflow === "published"}
            onClick={() => run("published")}
            className="rounded-lg bg-[var(--foreground)] px-3 py-1.5 text-xs text-[var(--background)] hover:opacity-90 disabled:opacity-40"
            title={!checklistOk ? "Чеклист не закрыт" : undefined}
          >
            Опубликовать / выгрузка (заглушка)
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run("needs_update")}
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 hover:opacity-90 disabled:opacity-40"
          >
            Требуется обновление
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run("paused")}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--background)] disabled:opacity-40"
          >
            Пауза
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run("draft")}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--background)] disabled:opacity-40"
          >
            Снять с публикации
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run("archived")}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--background)] disabled:opacity-40"
          >
            В архив
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-[var(--muted)]">
          Изменение статусов — роли с правом управления каналами.
        </p>
      )}
    </div>
  );
}
