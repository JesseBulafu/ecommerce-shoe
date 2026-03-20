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
        className={`rounded-lg px-3 py-1.5 text-footnote font-medium transition disabled:opacity-60 ${
          currentRole === "admin"
            ? "bg-red/10 text-red hover:bg-red/20"
            : "bg-green px-3 py-1.5 text-light-100 hover:bg-green/80"
        }`}
      >
        {isPending
          ? "Updating…"
          : currentRole === "admin"
            ? "Revoke Admin"
            : "Make Admin"}
      </button>
      {error && <p className="text-footnote text-red mt-1">{error}</p>}
    </div>
  );
}
