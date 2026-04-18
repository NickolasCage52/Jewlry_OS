import { APP_NAV } from "@/lib/navigation";

/** Подпись в топбаре (demo: `topbar__crumb` / `getRouteMeta().crumb`). */
const CRUMB_OVERRIDE: Record<string, string> = {
  "/app/dashboard": "Кабинет собственника",
  "/app/sales": "Рабочее место менеджера",
  "/app/content": "Контент-центр",
  "/app/catalog": "Каталог",
  "/app/search": "AI-поиск",
};

export function getShellCrumb(pathname: string): string {
  if (CRUMB_OVERRIDE[pathname]) return CRUMB_OVERRIDE[pathname];
  const sorted = [...APP_NAV].sort((a, b) => b.href.length - a.href.length);
  const hit = sorted.find(
    (n) => pathname === n.href || pathname.startsWith(`${n.href}/`),
  );
  return hit?.label ?? "Операционная система ювелирного бизнеса";
}
