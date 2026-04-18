"use client";

import { useState } from "react";
import { actionReleaseReservation } from "@/lib/ops/actions";

export function ReleaseReservationButton({ id }: { id: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        className="text-sm text-[var(--danger)] underline-offset-2 hover:underline"
        onClick={async () => {
          setMsg(null);
          const r = await actionReleaseReservation(id);
          setMsg(r.ok ? "Снято" : "Не удалось");
        }}
      >
        Снять резерв
      </button>
      {msg && <span className="ml-2 text-sm text-[var(--muted)]">{msg}</span>}
    </div>
  );
}
