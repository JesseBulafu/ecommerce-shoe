"use client";

import { useState } from "react";
import { FiltersDrawer } from "@/components/Filters";

export default function FiltersToggle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded border border-light-400 px-3 py-1.5 text-body text-dark-900 hover:border-dark-700 transition font-jost"
      >
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4 fill-current shrink-0"
          aria-hidden
        >
          <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        Filters
      </button>

      <FiltersDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
