import Link from "next/link";
import { sopService } from "@/lib/scale/services";
import type { SopSurface } from "@/lib/scale/types";
import { sopProcessAreaRu } from "@/lib/i18n/ru-ui";

export function ContextualSops({
  surface,
  title = "Связанные регламенты",
}: {
  surface: SopSurface;
  title?: string;
}) {
  const items = sopService.bySurface(surface);
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
      <h2 className="font-medium">{title}</h2>
      <ul className="mt-2 space-y-2">
        {items.map((s) => (
          <li key={s.id}>
            <Link href={`/app/sop/${s.id}`} className="hover:underline">
              {s.title}
            </Link>
            <span className="ml-2 text-xs text-[var(--muted)]">
              v{s.version} · {sopProcessAreaRu(s.processArea)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
