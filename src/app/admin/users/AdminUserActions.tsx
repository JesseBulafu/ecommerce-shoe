"use client";

import { useState, useTransition } from "react";
import { promoteToAdmin, revokeAdmin } from "@/lib/actions/admin";

export default function AdminUserActions({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAction = () => {
    setError(null);
    startTransition(async () => {
      const result =
        currentRole === "admin"
          ? await revokeAdmin(userId)
          : await promoteToAdmin(userId);

      if (!result.success) {
        setError(result.error ?? "Failed");
      }
    });
  };

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleAction}
        className={`rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer ${
          currentRole === "admin"
            ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25"
            : "bg-dark-900 text-light-100 hover:bg-dark-700"
        }`}
      >
        {isPending
          ? "Updating…"
          : currentRole === "admin"
            ? "Revoke Admin"
            : "Make Admin"}
      </button>
      {error && <p className="text-[11px] text-red mt-1.5">{error}</p>}
    </div>
  );
}
