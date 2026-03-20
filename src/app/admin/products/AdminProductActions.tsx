"use client";

import { useTransition } from "react";
import { toggleProductPublished } from "@/lib/actions/admin";

export default function AdminProductActions({
  productId,
  isPublished,
}: {
  productId: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleProductPublished(productId);
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      className={`rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer ${
        isPublished
          ? "bg-light-200 text-dark-700 hover:bg-light-300"
          : "bg-dark-900 text-light-100 hover:bg-dark-700"
      }`}
    >
      {isPending ? "Updating…" : isPublished ? "Unpublish" : "Publish"}
    </button>
  );
}
