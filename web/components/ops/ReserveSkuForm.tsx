"use client";

import { useState } from "react";
import { actionCreateReservation } from "@/lib/ops/actions";

export function ReserveSkuForm({
  sku,
  clientId,
  clientName,
}: {
  sku: string;
  clientId: string;
  clientName: string;
}) {
  const [until, setUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 16);
  });
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg(null);
        const iso = new Date(until).toISOString();
        const r = await actionCreateReservation(sku, clientId, clientName, iso);
        if (r.ok) setMsg("Резерв создан");
        else setMsg(r.error);
      }}
    >
      <label className="block text-xs text-[var(--muted)]">
        Действует до
        <input
          type="datetime-local"
          value={until}
          onChange={(e) => setUntil(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm"
      >
        Зарезервировать
      </button>
      {msg && <p className="text-sm text-[var(--warn)]">{msg}</p>}
    </form>
  );
}
