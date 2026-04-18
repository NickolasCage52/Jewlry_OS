import Link from "next/link";
import { sopService } from "@/lib/scale/services";
import { sopDocStatusRu } from "@/lib/i18n/ru-ui";

const AREA_LABEL: Record<string, string> = {
  sales: "Продажи",
  marketing: "Маркетинг",
  content: "Контент",
  stock: "Склад",
  supply: "Закупка",
  admin: "Админ",
  production: "Производство",
};

export default function SopLibraryPage() {
  const all = sopService.list();
  const byArea = new Map<string, typeof all>();
  for (const s of all) {
    const list = byArea.get(s.processArea) ?? [];
    list.push(s);
    byArea.set(s.processArea, list);
  }
  const areas = [...byArea.keys()].sort();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Регламенты и практические инструкции</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Операционная стандартизация: версии, владельцы, шаги — с контекстными
          ссылками в модулях.
        </p>
      </div>
      <div className="space-y-8">
        {areas.map((area) => (
          <section key={area}>
            <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
              {AREA_LABEL[area] ?? area}
            </h2>
            <ul className="mt-3 space-y-3">
              {(byArea.get(area) ?? []).map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <Link href={`/app/sop/${s.id}`} className="font-medium hover:underline">
                    {s.title}
                  </Link>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    v{s.version} · {sopDocStatusRu(s.status)} · владелец: {s.owner} · обновлено{" "}
                    {s.updatedAt} ({s.updatedBy})
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
