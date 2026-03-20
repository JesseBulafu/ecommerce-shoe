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
    return <span className="text-footnote text-green font-medium">Completed ✓</span>;
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleComplete}
        className="rounded-lg bg-green px-3 py-1.5 text-footnote font-medium text-light-100 hover:bg-green/80 transition disabled:opacity-60"
      >
        {isPending ? "Updating…" : "Mark Paid"}
      </button>
      {error && <p className="text-footnote text-red mt-1">{error}</p>}
    </div>
  );
}
