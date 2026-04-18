import type { PermissionCode } from "@/lib/types/session";

export type NavItem = {
  href: string;
  label: string;
  permission: PermissionCode;
};

export const APP_NAV: NavItem[] = [
  { href: "/app/dashboard", label: "Дашборд", permission: "dashboard:view_owner" },
  { href: "/app/search", label: "AI-поиск", permission: "ai:use" },
  { href: "/app/sales", label: "Продажи", permission: "client:view" },
  { href: "/app/catalog", label: "Каталог", permission: "product:view" },
  { href: "/app/pricing", label: "Цены и акции", permission: "pricing:view" },
  { href: "/app/stock", label: "Склад", permission: "inventory:view" },
  { href: "/app/procurement", label: "Закупки", permission: "procurement:view" },
  { href: "/app/content", label: "Контент", permission: "media:view" },
  { href: "/app/channels", label: "Каналы", permission: "channel:view" },
  { href: "/app/publications", label: "Публикации", permission: "channel:view" },
  { href: "/app/sop", label: "Регламенты", permission: "sop:view" },
  { href: "/app/onboarding", label: "Старт", permission: "onboarding:access" },
  { href: "/app/lifecycle", label: "Жизненный цикл", permission: "lifecycle:view" },
  { href: "/app/operations", label: "Цех", permission: "ops_floor:view" },
  { href: "/app/analytics", label: "Аналитика", permission: "analytics:view" },
  { href: "/app/faq", label: "ЧаВо", permission: "faq:view" },
  { href: "/app/admin/system", label: "Система", permission: "admin:system" },
  { href: "/app/settings/users", label: "Настройки", permission: "user:admin" },
];
