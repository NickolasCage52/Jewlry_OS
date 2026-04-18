import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { onboardingService } from "@/lib/scale/services";
import { roleLabelRu } from "@/lib/i18n/ru-ui";

export default async function OnboardingHubPage() {
  const session = await getSession();
  const tracks = onboardingService.allTracks();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Онбординг</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Чеклисты по ролям, ссылки на модули и регламенты — без LMS, только практичный старт.
        </p>
      </div>
      {session ? (
        <Link
          href={`/app/onboarding/${session.role}`}
          className="inline-block rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium hover:bg-[var(--background)]"
        >
          Мой трек: {roleLabelRu(session.role)}
        </Link>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {tracks.map((t) => (
          <Link
            key={t.role}
            href={`/app/onboarding/${t.role}`}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:bg-[var(--background)]"
          >
            <div className="font-medium">{roleLabelRu(t.role)}</div>
            <p className="mt-2 text-sm text-[var(--muted)]">{t.title}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Шагов: {t.items.length}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
