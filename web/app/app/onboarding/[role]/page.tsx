import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isRoleCode } from "@/lib/auth/session-cookie";
import { OnboardingItemToggle } from "@/components/scale/OnboardingItemToggle";
import { onboardingService } from "@/lib/scale/services";
import type { RoleCode } from "@/lib/types/session";
import {
  onboardingProgressStatusRu,
  roleLabelRu,
} from "@/lib/i18n/ru-ui";

export default async function OnboardingRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: raw } = await params;
  if (!isRoleCode(raw)) notFound();
  const role = raw as RoleCode;
  const session = await getSession();
  if (!session) notFound();

  if (role !== session.role && session.role !== "OWNER") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">
          Доступен только свой трек или просмотр владельцем.
        </p>
        <Link href="/app/onboarding" className="text-sm underline">
          К онбордингу
        </Link>
      </div>
    );
  }

  const track = onboardingService.track(role);
  if (!track) notFound();
  const prog = onboardingService.progress(session.id, role);
  const stats = onboardingService.progressStats(session.id, role);
  const doneSet = new Set(prog?.completedItemIds ?? []);
  const canToggle = session.role === role;

  return (
    <div className="space-y-6">
      <Link href="/app/onboarding" className="text-sm text-[var(--muted)] hover:underline">
        ← Онбординг
      </Link>
      <div>
        <h1 className="font-display text-3xl">{roleLabelRu(role)}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{track.title}</p>
        <p className="mt-2 text-sm">
          Прогресс: {stats.done}/{stats.total} · статус:{" "}
          <span className="font-medium">{onboardingProgressStatusRu(stats.status)}</span>
        </p>
      </div>
      <ul className="space-y-3">
        {track.items.map((item) => {
          const done = doneSet.has(item.id);
          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm"
            >
              <div>
                <span className={done ? "text-[var(--muted)] line-through" : ""}>
                  {item.label}
                </span>
                {item.href ? (
                  <div className="mt-1">
                    <Link href={item.href} className="text-xs underline">
                      Открыть
                    </Link>
                  </div>
                ) : null}
                {item.sopId ? (
                  <div className="mt-1">
                    <Link href={`/app/sop/${item.sopId}`} className="text-xs underline">
                      Регламент
                    </Link>
                  </div>
                ) : null}
              </div>
              {canToggle ? (
                <OnboardingItemToggle
                  itemId={item.id}
                  done={done}
                  trackRole={role}
                />
              ) : (
                <span className="text-xs text-[var(--muted)]">только просмотр</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
