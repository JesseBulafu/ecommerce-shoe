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

  // The first user in the list (ordered by createdAt ASC) is the original admin
  const firstUserId = users[0]?.id ?? "";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-heading-3 font-medium text-dark-900">Users</h1>
          <p className="text-body text-dark-700 mt-1">
            {users.length} user{users.length !== 1 && "s"} registered
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-light-300">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-light-300 bg-light-200">
              <th className="px-4 py-3 text-caption text-dark-700 font-medium">User</th>
              <th className="px-4 py-3 text-caption text-dark-700 font-medium">Role</th>
              <th className="px-4 py-3 text-caption text-dark-700 font-medium">Admin Key</th>
              <th className="px-4 py-3 text-caption text-dark-700 font-medium">Joined</th>
              <th className="px-4 py-3 text-caption text-dark-700 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isOriginalAdmin = u.id === firstUserId;
              const isSelf = u.id === currentUserId;

              return (
                <tr key={u.id} className="border-b border-light-300 hover:bg-light-200/50 transition">
                  <td className="px-4 py-3">
                    <p className="text-caption text-dark-900 font-medium">{u.name ?? "—"}</p>
                    <p className="text-footnote text-dark-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-footnote font-medium bg-green/10 text-green">
                        Admin
                        {isOriginalAdmin && (
                          <span className="text-[10px] bg-green/20 rounded px-1">Owner</span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-footnote font-medium bg-light-300 text-dark-500">
                        Customer
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.adminKey ? (
                      <code className="text-footnote text-dark-500 bg-light-200 px-2 py-1 rounded">
                        {u.adminKey.slice(0, 8)}…
                      </code>
                    ) : (
                      <span className="text-footnote text-dark-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-footnote text-dark-500">
                    {new Date(u.createdAt).toLocaleDateString("en-UG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="text-footnote text-dark-500">You</span>
                    ) : isOriginalAdmin ? (
                      <span className="text-footnote text-dark-500">Protected</span>
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
  );
}
