"use client";

import { useState, useTransition } from "react";
import { markCodComplete } from "@/lib/actions/admin";

export default function AdminOrderActions({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = () => {
    setError(null);
    startTransition(async () => {
      const result = await markCodComplete(orderId);
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error ?? "Failed");
      }
    });
  };

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Completed
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleComplete}
        className="rounded-lg bg-dark-900 px-3.5 py-1.5 text-[12px] font-semibold text-light-100 transition-all hover:bg-dark-700 active:scale-[0.97] disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "Updating…" : "Mark Paid"}
      </button>
      {error && <p className="text-[11px] text-red mt-1.5">{error}</p>}
    </div>
  );
}
