import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isAdmin } from "@/lib/actions/admin";
import { getSession } from "@/lib/auth/actions";
import ThemeToggle from "@/components/ThemeToggle";

/* ── Icons (inline SVG for zero-dependency elegance) ────────────────────────── */

function IconGrid({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconBag({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function IconBox({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconStore({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: IconGrid },
  { label: "Orders", href: "/admin/orders", icon: IconBag },
  { label: "Products", href: "/admin/products", icon: IconBox },
  { label: "Users", href: "/admin/users", icon: IconUsers },
];

function AdminSidebar({ userName, userImage }: { userName: string | null; userImage: string | null }) {
  return (
    <aside className="w-[260px] shrink-0 flex flex-col border-r border-light-300/60 bg-light-100 min-h-screen">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-dark-900 flex items-center justify-center">
            <span className="text-light-100 text-caption font-bold">A</span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-dark-900 leading-tight tracking-tight">Arstra</p>
            <p className="text-[11px] text-dark-500 leading-tight">Store Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-dark-500">Menu</p>
        {sidebarLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-dark-700 transition-all hover:bg-light-200 hover:text-dark-900 active:scale-[0.98]"
          >
            <Icon className="text-dark-500 group-hover:text-dark-900 transition-colors" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom: store link + theme toggle + user */}
      <div className="px-3 pb-5 space-y-3">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-dark-500 transition-all hover:bg-light-200 hover:text-dark-900"
        >
          <IconStore className="text-dark-500 group-hover:text-dark-900 transition-colors" />
          Back to Store
        </Link>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-dark-500">
          <ThemeToggle />
          <span className="text-[14px]">Toggle Theme</span>
        </div>
        <div className="border-t border-light-300/60 pt-4 px-3 flex items-center gap-3">
          {userImage ? (
            <Image src={userImage} alt="" width={32} height={32} className="rounded-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-violet-600 text-light-100 text-[12px] font-bold">
              {(userName ?? "A").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-dark-900 truncate leading-tight">{userName ?? "Admin"}</p>
            <p className="text-[11px] text-dark-500 leading-tight">Administrator</p>
          </div>
        </div>
      </div>
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
    <div className="flex min-h-screen bg-light-200/50 font-jost">
      <AdminSidebar userName={session.user.name ?? null} userImage={session.user.image ?? null} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
