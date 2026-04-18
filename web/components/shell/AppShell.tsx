"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { TopbarSearch } from "@/components/ui/topbar-search";
import { getShellCrumb } from "@/lib/shell/crumb";
import type { NavItem } from "@/lib/navigation";
import type { SessionUser } from "@/lib/types/session";
import { roleLabelRu } from "@/lib/i18n/ru-ui";
import { useCallback, useEffect, useRef, useState } from "react";

const MOBILE_NAV_ID = "app-mobile-nav";

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function SidebarColumn({
  user,
  links,
  pathname,
  onNavigate,
  variant = "full",
  className = "",
}: {
  user: SessionUser;
  links: NavItem[];
  pathname: string;
  onNavigate?: () => void;
  variant?: "full" | "embedded";
  className?: string;
}) {
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`.trim()}>
      {variant === "full" ? (
        <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-[18px] pb-[22px]">
          <span
            className="h-3 w-3 shrink-0 rotate-45 bg-[var(--gold)]"
            aria-hidden
          />
          <span className="font-display text-[1.35rem] font-semibold tracking-[0.02em]">
            Ювелирная ОС
          </span>
        </div>
      ) : null}
      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto py-4"
        aria-label="Разделы"
      >
        {links.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`ui-nav-link ${active ? "ui-nav-link--active" : ""}`.trim()}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-white/[0.08] px-[18px] pt-4">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[rgba(184,146,42,0.25)] text-sm font-semibold text-[var(--gold2)]"
            aria-hidden
          >
            {userInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-[var(--cream)]">
              {user.name}
            </div>
            <div className="text-[0.78rem] text-[var(--muted)]">
              {roleLabelRu(user.role)}
            </div>
          </div>
        </div>
        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className="text-[0.82rem] text-[var(--muted2)] transition-colors hover:text-[var(--cream)]"
          >
            Выйти
          </button>
        </form>
      </div>
    </div>
  );
}

export function AppShell({
  user,
  links,
  children,
}: {
  user: SessionUser;
  links: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const crumb = getShellCrumb(pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileNav();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [mobileNavOpen, closeMobileNav]);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <aside
        className="fixed bottom-0 left-0 top-0 z-[101] hidden w-[var(--sidebar-width)] flex-col bg-[var(--ink)] py-[18px] text-[var(--cream)] md:flex"
        aria-label="Основная навигация"
      >
        <SidebarColumn user={user} links={links} pathname={pathname} />
      </aside>

      <div
        className={`app-shell-drawer-backdrop ${mobileNavOpen ? "app-shell-drawer-backdrop--open" : ""}`.trim()}
        aria-hidden={!mobileNavOpen}
        onClick={closeMobileNav}
      />

      <div
        id={MOBILE_NAV_ID}
        className={`app-shell-drawer md:!hidden ${mobileNavOpen ? "app-shell-drawer--open" : ""}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label="Меню разделов"
        aria-hidden={!mobileNavOpen}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-[14px] pb-3 pt-[14px]">
          <span className="font-display text-lg font-semibold text-[var(--cream)]">
            Меню
          </span>
          <button
            type="button"
            ref={closeRef}
            className="topbar__icon-btn !bg-white/10 !text-[var(--cream)]"
            onClick={closeMobileNav}
            aria-label="Закрыть меню"
          >
            ×
          </button>
        </div>
        <SidebarColumn
          user={user}
          links={links}
          pathname={pathname}
          onNavigate={closeMobileNav}
          variant="embedded"
          className="min-h-0 pt-2"
        />
      </div>

      <div className="md:pl-[var(--sidebar-width)]">
        <header className="topbar">
          <div className="topbar__crumb-wrap">
            <button
              type="button"
              className="topbar__icon-btn topbar__menu-btn"
              aria-label="Открыть меню"
              aria-expanded={mobileNavOpen}
              aria-controls={MOBILE_NAV_ID}
              onClick={() => setMobileNavOpen(true)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="topbar__crumb topbar__crumb--truncate">{crumb}</div>
          </div>
          <div className="topbar__right">
            <TopbarSearch
              placeholder="Глобальный поиск…"
              aria-label="Глобальный поиск"
              className="topbar__search hidden min-[900px]:block"
            />
            <button
              type="button"
              className="topbar__icon-btn"
              aria-label="Уведомления"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div className="topbar__avatar" aria-hidden>
              {userInitials(user.name)}
            </div>
          </div>
        </header>
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
