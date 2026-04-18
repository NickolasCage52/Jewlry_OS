import Link from "next/link";
import { systemHealthService } from "@/lib/scale/services";
import {
  aiFeatureLabelRu,
  integrationStatusRu,
  publishWorkflowRu,
  roleLabelRu,
} from "@/lib/i18n/ru-ui";
import type { AiFeatureKey } from "@/lib/ai/types";

export default function AdminSystemPage() {
  const team = systemHealthService.team();
  const integrations = systemHealthService.integrations();
  const chWarn = systemHealthService.channelsWarnings();
  const pubWarn = systemHealthService.publishingWarnings();
  const ai = systemHealthService.ai();
  const opsMsgs = systemHealthService.recentOpsErrors();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Здоровье системы</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Команда, интеграции, каналы, AI и операционные сигналы — компактная
          административная панель.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/app/settings/users" className="underline">
          Пользователи
        </Link>
        <Link href="/app/admin/integrations" className="underline">
          Интеграции
        </Link>
        <Link href="/app/channels" className="underline">
          Каналы
        </Link>
      </div>
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">Команда и доступ</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {team.map((u) => (
            <li key={u.id} className="flex flex-wrap justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-0">
              <span>
                {u.name}{" "}
                <span className="text-xs text-[var(--muted)]">
                  ({roleLabelRu(u.role)})
                </span>
              </span>
              <span className="text-xs text-[var(--muted)]">
                вход: {u.lastLoginDaysAgo === 0 ? "сегодня" : `${u.lastLoginDaysAgo} дн. назад`}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Модули (заглушка): отображаются назначенные контуры для масштабирования RBAC.
        </p>
      </section>
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">AI</h2>
        <p className="mt-2 text-sm">
          Провайдер: <strong>{ai.provider}</strong> · ключи:{" "}
          {ai.apiConfigured ? "настроены / демо" : "не заданы"}
        </p>
        <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
          {ai.features.map((f) => (
            <li key={f.key}>
              {aiFeatureLabelRu(f.key as AiFeatureKey)}:{" "}
              {f.enabled ? "вкл." : "выкл."}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">Интеграции (заглушки)</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {integrations.map((i) => (
            <li key={i.id}>
              <span className="font-medium">{i.name}</span> · {integrationStatusRu(i.status)} ·{" "}
              <span className="text-xs text-[var(--muted)]">{i.detail}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">Каналы — предупреждения</h2>
        <ul className="mt-2 space-y-1 text-xs">
          {chWarn.length === 0 ? (
            <li className="text-[var(--muted)]">—</li>
          ) : (
            chWarn.map((w, i) => (
              <li key={i}>
                {w.channel}: {w.message}
              </li>
            ))
          )}
        </ul>
      </section>
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">Публикации — внимание</h2>
        <ul className="mt-2 space-y-1 text-xs">
          {pubWarn.map((p) => (
            <li key={p.id}>
              {p.sku} · {p.channel} · {publishWorkflowRu(p.workflow)}:{" "}
              {p.issues.join(", ") || "устарело"}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-medium">Последние операционные события</h2>
        <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
          {opsMsgs.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
