import Link from "next/link";
import { MOCK_CLIENTS, clientKey } from "@/lib/mock/clients";
import { lifecycleService } from "@/lib/scale/services";
import { lifecycleStageRu } from "@/lib/i18n/ru-ui";

export default function LifecyclePage() {
  const rows = MOCK_CLIENTS.map((c) => {
    const k = clientKey(c.id);
    const lc = lifecycleService.get(k);
    return { client: c, lc, k };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Клиентский жизненный цикл</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Состояния, LTV, частота и мягкие триггеры заботы — без маркетингового
          автопилота.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Клиент</th>
              <th className="px-3 py-2">Этап</th>
              <th className="px-3 py-2">Заказы ~</th>
              <th className="px-3 py-2">LTV</th>
              <th className="px-3 py-2">Сегмент</th>
              <th className="px-3 py-2">Триггеры</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ client, lc, k }) => (
              <tr key={client.id} className="border-b border-[var(--border)]">
                <td className="px-3 py-2">
                  <Link href={`/app/sales/${client.id}`} className="font-medium hover:underline">
                    {client.name}
                  </Link>
                  <div className="text-xs text-[var(--muted)]">{k}</div>
                </td>
                <td className="px-3 py-2 text-xs">
                  {lc ? lifecycleStageRu(lc.lifecycle) : "—"}
                </td>
                <td className="px-3 py-2 text-xs">{lc?.ordersApprox ?? "—"}</td>
                <td className="px-3 py-2 text-xs">
                  {lc
                    ? `${lc.lifetimeValueRub.toLocaleString("ru-RU")} \u20BD`
                    : "—"}
                </td>
                <td className="px-3 py-2 text-xs text-[var(--muted)]">
                  {lc?.segmentNote ?? "—"}
                </td>
                <td className="px-3 py-2 text-xs text-[var(--muted)]">
                  {lc?.careTriggers.join("; ") ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
