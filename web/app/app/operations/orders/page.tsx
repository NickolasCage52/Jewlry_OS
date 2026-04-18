import Link from "next/link";
import { operationsOrdersService } from "@/lib/scale/services";

const STAGE_RU: Record<string, string> = {
  new_order: "Новый заказ",
  in_work: "В работе",
  waiting_stone: "Ждём камень",
  assembly: "Сборка",
  finishing: "Отделка",
  ready: "Готово",
  shipped: "Отгружен / выдан",
};

const RESP: Record<string, string> = {
  manager: "Менеджер",
  workshop: "Мастер / цех",
  warehouse: "Склад",
  supply: "Закупка",
};

export default function ProductionOrdersPage() {
  const orders = operationsOrdersService.list();

  return (
    <div className="space-y-6">
      <Link href="/app/operations" className="text-sm text-[var(--muted)] hover:underline">
        ← Операции
      </Link>
      <div>
        <h1 className="font-display text-3xl">Производство (упрощённо)</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Статусы, ответственные и сигнал «зависло» — без MES.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Заказ</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Клиент</th>
              <th className="px-3 py-2">Стадия</th>
              <th className="px-3 py-2">Ответственный</th>
              <th className="px-3 py-2">Срок</th>
              <th className="px-3 py-2">Сигнал</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-[var(--border)]">
                <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
                <td className="px-3 py-2 font-mono text-xs">
                  <Link
                    href={`/app/catalog/${encodeURIComponent(o.sku)}`}
                    className="hover:underline"
                  >
                    {o.sku}
                  </Link>
                </td>
                <td className="px-3 py-2">{o.clientName}</td>
                <td className="px-3 py-2 text-xs">{STAGE_RU[o.stage] ?? o.stage}</td>
                <td className="px-3 py-2 text-xs">{RESP[o.responsible]}</td>
                <td className="px-3 py-2 text-xs">{o.dueAt}</td>
                <td className="px-3 py-2 text-xs">
                  {o.stuck ? (
                    <span className="text-amber-800">
                      Завис · {o.delayReason ?? "проверить"}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
