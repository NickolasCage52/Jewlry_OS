"use client";

import { toggleOnboardingItem } from "@/lib/scale/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function OnboardingItemToggle({
  itemId,
  done,
  trackRole,
}: {
  itemId: string;
  done: boolean;
  trackRole: import("@/lib/types/session").RoleCode;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await toggleOnboardingItem(itemId, !done, trackRole);
          router.refresh();
        })
      }
      className="rounded border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--background)] disabled:opacity-40"
    >
      {done ? "Снять" : "Готово"}
    </button>
  );
}
