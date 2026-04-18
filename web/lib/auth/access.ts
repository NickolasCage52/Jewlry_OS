import type { PermissionCode, RoleCode } from "@/lib/types/session";

/** Role → permissions (foundation + operations layer). */
const ROLE_PERMISSIONS: Record<RoleCode, PermissionCode[]> = {
  OWNER: [
    "client:view",
    "deal:view",
    "deal:assign",
    "note:create",
    "inventory:view",
    "product:view",
    "media:view",
    "faq:view",
    "dashboard:view_owner",
    "report:export",
    "pricing:view",
    "pricing:edit",
    "promo:manage",
    "procurement:view",
    "analytics:view",
    "channel:view",
    "channel:manage",
    "reservation:create",
    "ai:use",
    "sop:view",
    "onboarding:access",
    "lifecycle:view",
    "ops_floor:view",
    "admin:system",
  ],
  MKT: [
    "product:view",
    "media:view",
    "media:upload",
    "media:edit_meta",
    "faq:view",
    "faq:edit",
    "report:export",
    "pricing:view",
    "promo:manage",
    "channel:view",
    "channel:manage",
    "analytics:view",
    "procurement:view",
    "ai:use",
    "sop:view",
    "onboarding:access",
    "lifecycle:view",
    "ops_floor:view",
  ],
  SALES: [
    "client:view",
    "client:create",
    "client:edit",
    "deal:view",
    "deal:create",
    "deal:edit_status",
    "deal:assign",
    "note:create",
    "reminder:create",
    "inventory:view",
    "product:view",
    "media:view",
    "faq:view",
    "pricing:view",
    "channel:view",
    "analytics:view",
    "reservation:create",
    "ai:use",
    "sop:view",
    "onboarding:access",
    "lifecycle:view",
    "ops_floor:view",
  ],
  STOCK: [
    "client:view",
    "deal:view",
    "inventory:view",
    "inventory:adjust",
    "reservation:release",
    "product:view",
    "media:view",
    "faq:view",
    "pricing:view",
    "analytics:view",
    "channel:view",
    "ai:use",
    "sop:view",
    "onboarding:access",
    "ops_floor:view",
  ],
  SUPPLY: [
    "product:view",
    "inventory:view",
    "media:view",
    "faq:view",
    "procurement:view",
    "procurement:edit",
    "pricing:view",
    "analytics:view",
    "channel:view",
    "ai:use",
    "sop:view",
    "onboarding:access",
    "ops_floor:view",
    "admin:system",
  ],
  ADMIN: [
    "client:view",
    "client:create",
    "client:edit",
    "deal:view",
    "deal:create",
    "deal:edit_status",
    "deal:assign",
    "inventory:view",
    "inventory:adjust",
    "product:view",
    "product:edit_master",
    "media:view",
    "media:upload",
    "media:edit_meta",
    "faq:view",
    "faq:edit",
    "user:admin",
    "report:export",
    "pricing:view",
    "pricing:edit",
    "promo:manage",
    "procurement:view",
    "procurement:edit",
    "analytics:view",
    "channel:view",
    "channel:manage",
    "reservation:create",
    "reservation:release",
    "ai:use",
    "sop:view",
    "onboarding:access",
    "lifecycle:view",
    "ops_floor:view",
    "admin:system",
    "lifecycle:view",
  ],
};

export function roleHasPermission(
  role: RoleCode,
  permission: PermissionCode,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

const ROUTE_REQUIRED: { prefix: string; permission: PermissionCode }[] = [
  { prefix: "/app/dashboard", permission: "dashboard:view_owner" },
  { prefix: "/app/sales", permission: "client:view" },
  { prefix: "/app/content", permission: "media:view" },
  { prefix: "/app/catalog", permission: "product:view" },
  { prefix: "/app/faq", permission: "faq:view" },
  { prefix: "/app/settings", permission: "user:admin" },
  { prefix: "/app/pricing", permission: "pricing:view" },
  { prefix: "/app/stock", permission: "inventory:view" },
  { prefix: "/app/procurement", permission: "procurement:view" },
  { prefix: "/app/analytics", permission: "analytics:view" },
  { prefix: "/app/channels", permission: "channel:view" },
  { prefix: "/app/publications", permission: "channel:view" },
  { prefix: "/app/sop", permission: "sop:view" },
  { prefix: "/app/onboarding", permission: "onboarding:access" },
  { prefix: "/app/lifecycle", permission: "lifecycle:view" },
  { prefix: "/app/operations", permission: "ops_floor:view" },
  { prefix: "/app/admin", permission: "admin:system" },
  { prefix: "/app/search", permission: "ai:use" },
];

export function canAccessPath(role: RoleCode, pathname: string): boolean {
  for (const { prefix, permission } of ROUTE_REQUIRED) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return roleHasPermission(role, permission);
    }
  }
  return true;
}

export function getDefaultAppPath(role: RoleCode): string {
  switch (role) {
    case "OWNER":
      return "/app/dashboard";
    case "MKT":
      return "/app/content";
    case "SALES":
      return "/app/sales";
    case "STOCK":
      return "/app/stock";
    case "SUPPLY":
      return "/app/procurement";
    case "ADMIN":
      return "/app/settings/users";
    default:
      return "/app/catalog";
  }
}
