import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDefaultAppPath } from "@/lib/auth/access";

export default async function Home() {
  const session = await getSession();
  if (session) redirect(getDefaultAppPath(session.role));
  redirect("/login");
}
