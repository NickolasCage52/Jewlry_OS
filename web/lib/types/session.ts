export type RoleCode =
  | "OWNER"
  | "MKT"
  | "SALES"
  | "STOCK"
  | "SUPPLY"
  | "ADMIN";

export type PermissionCode =
  | "client:view"
  | "client:create"
  | "client:edit"
  | "deal:view"
  | "deal:create"
  | "deal:edit_status"
  | "deal:assign"
  | "note:create"
  | "reminder:create"
  | "inventory:view"
  | "inventory:adjust"
  | "product:view"
  | "product:edit_master"
  | "media:view"
  | "media:upload"
  | "media:edit_meta"
  | "faq:view"
  | "faq:edit"
  | "dashboard:view_owner"
  | "report:export"
  | "user:admin"
  | "reservation:release"
  | "reservation:create"
  | "pricing:view"
  | "pricing:edit"
  | "promo:manage"
  | "procurement:view"
  | "procurement:edit"
  | "analytics:view"
  | "channel:view"
  | "channel:manage"
  | "ai:use"
  | "sop:view"
  | "onboarding:access"
  | "lifecycle:view"
  | "ops_floor:view"
  | "admin:system";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: RoleCode;
};
