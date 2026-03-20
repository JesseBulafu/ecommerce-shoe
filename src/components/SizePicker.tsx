"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import type { MockSize } from "@/lib/mock/product";

interface SizePickerProps {
  sizes: MockSize[];
  /** Called whenever the selected size changes (including deselection → null). */
  onSelect?: (label: string | null) => void;
}

export default function SizePicker({ sizes, onSelect }: SizePickerProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleClick = (label: string, available: boolean) => {
    if (!available) return;
    const next = selected === label ? null : label;
    setSelected(next);
    onSelect?.(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Row: label + size guide link */}
      <div className="flex items-center justify-between">
        <span className="text-body-medium font-jost text-dark-900">Select Size</span>
        <button
          type="button"
          className="flex items-center gap-1 text-caption font-jost text-dark-700 underline underline-offset-2 hover:text-dark-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
          aria-label="Open size guide"
        >
          <Ruler size={13} aria-hidden />
          Size Guide
        </button>
      </div>

      {/* Size grid */}
      <div
        role="group"
        aria-label="Available sizes"
        className="grid grid-cols-6 gap-2"
      >
        {sizes.map(({ label, available }) => {
          const isSelected = selected === label;
          return (
            <button
              key={label}
              type="button"
              disabled={!available}
              onClick={() => handleClick(label, available)}
              aria-pressed={isSelected}
              aria-disabled={!available}
              className={[
                "flex items-center justify-center rounded border py-2 text-caption font-jost transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900",
                available
                  ? isSelected
                    ? "border-dark-900 bg-dark-900 text-light-100"
                    : "border-light-300 text-dark-900 hover:border-dark-700"
                  : "border-light-300 text-light-400 cursor-not-allowed line-through",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
