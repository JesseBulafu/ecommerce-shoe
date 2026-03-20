import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/lib/actions/admin";
import { formatPrice } from "@/lib/utils/currency";

export const metadata: Metadata = {
  title: "Admin Dashboard — Arstra",
};

/* ── Stat Card ─────────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  change,
  icon,
  accent = "violet",
}: {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  accent?: "violet" | "green" | "orange" | "blue";
}) {
  const accentMap = {
    violet: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-amber-50 text-amber-600",
    blue: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-light-300/60 bg-light-100 p-6 transition-all hover:shadow-lg hover:shadow-dark-900/[0.04] hover:-translate-y-0.5">
      {/* Subtle gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-light-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentMap[accent]} transition-transform group-hover:scale-105`}>
            {icon}
          </div>
          {change && (
            <span className="text-[12px] font-medium text-green bg-green/8 px-2 py-0.5 rounded-full">
              {change}
            </span>
          )}
        </div>
        <p className="text-[13px] font-medium text-dark-500 mb-1">{label}</p>
        <p className="text-[28px] font-semibold text-dark-900 tracking-tight leading-none">{value}</p>
      </div>
    </div>
  );
}

/* ── Quick Action Card ─────────────────────────────────────────────────────── */

function QuickAction({
  label,
  description,
  href,
  icon,
}: {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-light-300/60 bg-light-100 p-5 transition-all hover:shadow-lg hover:shadow-dark-900/[0.04] hover:-translate-y-0.5"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-light-200 text-dark-700 transition-colors group-hover:bg-dark-900 group-hover:text-light-100">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-dark-900 group-hover:text-dark-900">{label}</p>
        <p className="text-[13px] text-dark-500 truncate">{description}</p>
      </div>
      <svg className="ml-auto h-5 w-5 text-dark-500 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

/* ── Inline SVG Icons ──────────────────────────────────────────────────────── */

function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function DollarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-semibold text-dark-900 tracking-tight">Dashboard</h1>
        <p className="text-[15px] text-dark-500 mt-1">
          Welcome back. Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<UsersIcon />}
          accent="violet"
        />
        <StatCard
          label="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={<BoxIcon />}
          accent="blue"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={<BagIcon />}
          accent="violet"
        />
        <StatCard
          label="Pending COD"
          value={stats.pendingCodOrders.toLocaleString()}
          icon={<ClockIcon />}
          accent="orange"
        />
        <StatCard
          label="Completed Orders"
          value={stats.completedOrders.toLocaleString()}
          icon={<CheckIcon />}
          accent="green"
        />
        <StatCard
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={<DollarIcon />}
          accent="green"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-[16px] font-semibold text-dark-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            label="Manage Orders"
            description="View, track, and update customer orders"
            href="/admin/orders"
            icon={<BagIcon />}
          />
          <QuickAction
            label="Manage Products"
            description="Publish, edit, and organize your catalog"
            href="/admin/products"
            icon={<BoxIcon />}
          />
          <QuickAction
            label="Manage Users"
            description="View registered users and manage roles"
            href="/admin/users"
            icon={<UsersIcon />}
          />
          <QuickAction
            label="Visit Store"
            description="See your store from a customer&apos;s view"
            href="/"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}
