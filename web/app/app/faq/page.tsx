import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/mock/faq";
import { faqCategoryRu } from "@/lib/i18n/ru-ui";

export default function FaqPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Частые вопросы</h1>
      <p className="text-sm text-[var(--muted)]">
        База ответов для менеджеров. AI-поиск по этим пунктам — на странице{" "}
        <Link href="/app/search" className="underline">
          AI-поиск
        </Link>
        .
      </p>
      <ul className="space-y-3">
        {FAQ_ITEMS.map((f) => (
          <li
            key={f.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm"
          >
            <div className="font-medium">{f.q}</div>
            <p className="mt-2 text-[var(--muted)]">{f.a}</p>
            <div className="mt-1 text-[10px] uppercase text-[var(--muted)]">
              {faqCategoryRu(f.cat)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
