import { roleHasPermission } from "@/lib/auth/access";
import type { PermissionCode, RoleCode } from "@/lib/types/session";
import { roleLabelRu } from "@/lib/i18n/ru-ui";

const ROLES: RoleCode[] = [
  "OWNER",
  "MKT",
  "SALES",
  "STOCK",
  "SUPPLY",
  "ADMIN",
];
const PERMS: PermissionCode[] = [
  "dashboard:view_owner",
  "pricing:edit",
  "promo:manage",
  "inventory:adjust",
  "reservation:create",
  "procurement:edit",
  "channel:manage",
  "user:admin",
];

export default function SettingsRolesPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Матрица ролей (только просмотр)</h1>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs text-[var(--muted)]">
              <th className="px-2 py-2">Роль</th>
              {PERMS.map((p) => (
                <th key={p} className="px-1 py-2 font-mono text-[10px]">
                  {p.replace(":", "\n")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role) => (
              <tr key={role} className="border-b border-[var(--border)]">
                <td className="px-2 py-2 font-medium">{roleLabelRu(role)}</td>
                {PERMS.map((p) => (
                  <td key={p} className="px-1 py-2 text-center">
                    {roleHasPermission(role, p) ? "+" : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
