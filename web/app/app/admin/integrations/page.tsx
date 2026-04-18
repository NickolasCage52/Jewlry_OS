import Link from "next/link";
import { systemHealthService } from "@/lib/scale/services";
import { integrationStatusRu } from "@/lib/i18n/ru-ui";

export default function AdminIntegrationsPage() {
  const integrations = systemHealthService.integrations();

  return (
    <div className="space-y-6">
      <Link href="/app/admin/system" className="text-sm text-[var(--muted)] hover:underline">
        ← Система
      </Link>
      <div>
        <h1 className="font-display text-3xl">Интеграции</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Заглушки, готовые к адаптерам: позже подключаются реальные клиенты без смены интерфейса.
        </p>
      </div>
      <ul className="space-y-4">
        {integrations.map((i) => (
          <li
            key={i.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm"
          >
            <div className="font-medium">{i.name}</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Статус: {integrationStatusRu(i.status)} · проверка: {i.lastCheck}
            </p>
            <p className="mt-2 text-sm">{i.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
