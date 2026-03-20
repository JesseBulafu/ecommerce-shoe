"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

/* ── Icons ──────────────────────────────────────────────────────────────────── */

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

/* ── Sidebar Content (shared between desktop & mobile) ──────────────────────── */

function SidebarContent({
  userName,
  userImage,
  onNavigate,
}: {
  userName: string | null;
  userImage: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Brand */}
      <div className="px-6 pt-7 pb-6">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onNavigate}>
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
        {sidebarLinks.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all active:scale-[0.98] ${
                isActive
                  ? "bg-dark-900 text-light-100"
                  : "text-dark-700 hover:bg-light-200 hover:text-dark-900"
              }`}
            >
              <Icon
                className={`transition-colors ${
                  isActive ? "text-light-100" : "text-dark-500 group-hover:text-dark-900"
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-3">
        <Link
          href="/"
          onClick={onNavigate}
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
    </>
  );
}

/* ── Responsive Admin Shell ─────────────────────────────────────────────────── */

export default function AdminShell({
  userName,
  userImage,
  children,
}: {
  userName: string | null;
  userImage: string | null;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen bg-light-200/50 font-jost">
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-light-300/60 bg-light-100 min-h-screen">
        <SidebarContent userName={userName} userImage={userImage} />
      </aside>

      {/* ── Mobile Overlay ───────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-light-100 border-r border-light-300/60 transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-light-200 transition-colors text-dark-700"
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <SidebarContent
          userName={userName}
          userImage={userImage}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-light-300/60 bg-light-100 px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-light-200 transition-colors text-dark-900"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-dark-900 flex items-center justify-center">
              <span className="text-light-100 text-[11px] font-bold">A</span>
            </div>
            <span className="text-[15px] font-semibold text-dark-900 tracking-tight">Arstra Admin</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
