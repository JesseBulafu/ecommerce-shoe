import type { Metadata } from "next";
import { getDashboardStats } from "@/lib/actions/admin";
import { formatPrice } from "@/lib/utils/currency";
import { Users, Package, ShoppingBag, Clock, CheckCircle, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard — Arstra",
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-light-300 bg-light-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-caption text-dark-700">{label}</span>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent ?? "bg-light-200"}`}>
          <Icon size={20} className="text-dark-900" />
        </div>
      </div>
      <p className="text-heading-3 text-dark-900">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-heading-3 font-medium text-dark-900 mb-2">Dashboard</h1>
      <p className="text-body text-dark-700 mb-8">
        Welcome back. Here&apos;s an overview of your store.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          accent="bg-light-200"
        />
        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          icon={Package}
          accent="bg-light-200"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          accent="bg-light-200"
        />
        <StatCard
          label="Pending COD Orders"
          value={stats.pendingCodOrders}
          icon={Clock}
          accent="bg-orange/10"
        />
        <StatCard
          label="Completed Orders"
          value={stats.completedOrders}
          icon={CheckCircle}
          accent="bg-green/10"
        />
        <StatCard
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
          accent="bg-green/10"
        />
      </div>
    </div>
  );
}
