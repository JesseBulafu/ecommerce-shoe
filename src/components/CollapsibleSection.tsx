"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Star } from "lucide-react";

export interface CollapsibleSectionProps {
  title: string;
  /** Shown inline in the header row after the title (e.g. review count + stars) */
  headerExtra?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  headerExtra,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-light-300">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
      >
        <span className="flex items-center gap-3">
          <span className="text-body-medium font-jost text-dark-900">{title}</span>
          {headerExtra}
        </span>
        {open ? (
          <ChevronUp size={18} className="text-dark-700 shrink-0" aria-hidden />
        ) : (
          <ChevronDown size={18} className="text-dark-700 shrink-0" aria-hidden />
        )}
      </button>

      {open && (
        <div className="pb-5 font-jost text-body text-dark-700">{children}</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Convenience: star rating display (purely visual, used inside reviews section)
// ---------------------------------------------------------------------------

export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < Math.round(rating) ? "text-dark-900 fill-dark-900" : "text-light-400 fill-light-400"}
          aria-hidden
        />
      ))}
    </span>
  );
}
