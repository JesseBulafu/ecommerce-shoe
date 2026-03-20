import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/actions/admin";
import { getSession } from "@/lib/auth/actions";

function AdminSidebar() {
  const links = [
    { label: "Dashboard", href: "/admin" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Products", href: "/admin/products" },
    { label: "Users", href: "/admin/users" },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-light-300 bg-light-200 min-h-screen">
      <div className="p-6">
        <Link href="/admin" className="text-heading-3 font-jost font-medium text-dark-900">
          Arstra Admin
        </Link>
        <p className="text-footnote text-dark-500 mt-1">Store Management</p>
      </div>
      <nav className="px-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body font-jost text-dark-700 hover:bg-light-300 hover:text-dark-900 transition mb-1"
          >
            {link.label}
          </Link>
        ))}
        <div className="mt-6 border-t border-light-300 pt-4 px-3">
          <Link
            href="/"
            className="text-caption text-dark-500 hover:text-dark-900 transition"
          >
            ← Back to Store
          </Link>
        </div>
      </nav>
    </aside>
  );
}

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
    <div className="flex min-h-screen bg-light-100 font-jost">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
