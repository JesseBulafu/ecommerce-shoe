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
      className={`rounded-lg px-3 py-1.5 text-footnote font-medium transition disabled:opacity-60 ${
        isPublished
          ? "bg-light-300 text-dark-700 hover:bg-light-400"
          : "bg-dark-900 text-light-100 hover:bg-dark-700"
      }`}
    >
      {isPending ? "Updating…" : isPublished ? "Unpublish" : "Publish"}
    </button>
  );
}
