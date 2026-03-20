import type { Metadata } from "next";
import { getAdminUsers } from "@/lib/actions/admin";
import { getSession } from "@/lib/auth/actions";
import AdminUserActions from "./AdminUserActions";

export const metadata: Metadata = {
  title: "Users — Admin — Arstra",
};

export default async function AdminUsersPage() {
  const [users, session] = await Promise.all([getAdminUsers(), getSession()]);
  const currentUserId = session?.user?.id ?? "";
  const firstUserId = users[0]?.id ?? "";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[26px] font-semibold text-dark-900 tracking-tight">Users</h1>
          <p className="text-[15px] text-dark-500 mt-1">
            {users.length} user{users.length !== 1 && "s"} registered
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-light-300/60 bg-light-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-light-300/60">
                <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">User</th>
                <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Role</th>
                <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Admin Key</th>
                <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Joined</th>
                <th className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-dark-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-300/40">
              {users.map((u) => {
                const isOriginalAdmin = u.id === firstUserId;
                const isSelf = u.id === currentUserId;

                return (
                  <tr key={u.id} className="group transition hover:bg-light-200/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-9 w-9 rounded-full bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 text-[13px] font-bold shrink-0">
                          {(u.name ?? u.email).charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-dark-900 truncate">{u.name ?? "—"}</p>
                          <p className="text-[12px] text-dark-500 mt-0.5 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Admin
                          {isOriginalAdmin && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 rounded px-1 py-0.5 ml-1">Owner</span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold bg-light-200 text-dark-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-dark-500" />
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {u.adminKey ? (
                        <code className="text-[12px] text-dark-500 bg-light-200 px-2.5 py-1 rounded-lg font-mono">
                          {u.adminKey.slice(0, 8)}…
                        </code>
                      ) : (
                        <span className="text-[12px] text-dark-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[12px] text-dark-500">
                      {new Date(u.createdAt).toLocaleDateString("en-UG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      {isSelf ? (
                        <span className="text-[12px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/15 px-2.5 py-1 rounded-lg">You</span>
                      ) : isOriginalAdmin ? (
                        <span className="text-[12px] text-dark-500">Protected</span>
                      ) : (
                        <AdminUserActions userId={u.id} currentRole={u.role} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
