import type { RoleCode, SessionUser } from "@/lib/types/session";

const DEMO: Record<RoleCode, SessionUser> = {
  OWNER: {
    id: "u-owner",
    email: "owner@atelier.demo",
    name: "Тигран",
    role: "OWNER",
  },
  MKT: {
    id: "u-mkt",
    email: "mkt@atelier.demo",
    name: "Полина Волкова",
    role: "MKT",
  },
  SALES: {
    id: "u-sales",
    email: "sales@atelier.demo",
    name: "Анна Смирнова",
    role: "SALES",
  },
  STOCK: {
    id: "u-stock",
    email: "stock@atelier.demo",
    name: "Илья Соколов",
    role: "STOCK",
  },
  SUPPLY: {
    id: "u-supply",
    email: "supply@atelier.demo",
    name: "Марина Лебедева",
    role: "SUPPLY",
  },
  ADMIN: {
    id: "u-admin",
    email: "admin@atelier.demo",
    name: "Сергей Николаев",
    role: "ADMIN",
  },
};

export function getDemoUser(role: RoleCode): SessionUser {
  return { ...DEMO[role] };
}

export const DEMO_ROLE_OPTIONS: { role: RoleCode; label: string; hint: string }[] =
  [
    { role: "OWNER", label: "Собственник", hint: "Дашборд, обзор, без операций" },
    { role: "SALES", label: "Продажи", hint: "Клиенты и сделки" },
    { role: "MKT", label: "Маркетинг", hint: "Контент и медиа" },
    { role: "STOCK", label: "Склад", hint: "Остатки и каталог" },
    { role: "SUPPLY", label: "Снабжение", hint: "Чтение каталога и остатков" },
    { role: "ADMIN", label: "Админ", hint: "Пользователи и роли" },
  ];
