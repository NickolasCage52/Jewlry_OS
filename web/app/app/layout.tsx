import { roleHasPermission } from "@/lib/auth/access";
import { getSession } from "@/lib/auth/session";
import { APP_NAV } from "@/lib/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { expireStaleReservations } from "@/lib/ops/mutations";
import { getOpsStore } from "@/lib/ops/store";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  expireStaleReservations(getOpsStore());
  const links = APP_NAV.filter((item) =>
    roleHasPermission(session.role, item.permission),
  );
  return (
    <AppShell user={session} links={links}>
      {children}
    </AppShell>
  );
}
