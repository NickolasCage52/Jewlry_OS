import { redirect } from "next/navigation";
import { getDefaultAppPath } from "@/lib/auth/access";
import { getSession } from "@/lib/auth/session";

export default async function AppIndex() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(getDefaultAppPath(session.role));
}
