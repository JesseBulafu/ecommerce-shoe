import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/actions/admin";
import { getSession } from "@/lib/auth/actions";
import AdminShell from "@/components/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");

  const admin = await isAdmin();
  if (!admin) redirect("/");

  return (
    <AdminShell
      userName={session.user.name ?? null}
      userImage={session.user.image ?? null}
    >
      {children}
    </AdminShell>
  );
}
