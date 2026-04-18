"use client";

import { markSopViewed } from "@/lib/scale/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function SopReadToggle({
  sopId,
  read,
}: {
  sopId: string;
  read: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await markSopViewed(sopId, !read);
          router.refresh();
        })
      }
      className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--background)] disabled:opacity-40"
    >
      {read ? "Снять отметку «просмотрено»" : "Отметить как просмотренный"}
    </button>
  );
}
