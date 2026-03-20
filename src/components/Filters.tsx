"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toggleArrayParam, removeParam, clearFilters, isParamActive } from "@/lib/utils/query";

// ---------------------------------------------------------------------------
// Filter data
// ---------------------------------------------------------------------------

const GENDERS = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex / Kids", value: "unisex" },
];

const SIZES = [
  "US 6", "US 6.5", "US 7", "US 7.5", "US 8", "US 8.5",
  "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 11.5",
  "US 12", "US 13",
];

const COLORS = [
  { label: "Black",  value: "black",  hex: "#111111" },
  { label: "White",  value: "white",  hex: "#e5e5e5" },
  { label: "Red",    value: "red",    hex: "#d33918" },
  { label: "Blue",   value: "blue",   hex: "#1d4ed8" },
  { label: "Grey",   value: "grey",   hex: "#757575" },
  { label: "Green",  value: "green",  hex: "#007d48" },
  { label: "Orange", value: "orange", hex: "#d37918" },
  { label: "Pink",   value: "pink",   hex: "#f472b6" },
];

const PRICES = [
  { label: "Under $50",    value: "0-50" },
  { label: "$50 – $100",   value: "50-100" },
  { label: "$100 – $150",  value: "100-150" },
  { label: "$150+",        value: "150-9999" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-light-300 py-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-body-medium font-jost font-medium text-dark-900"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {title}
        <span
          className={`text-dark-500 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {open && <div className="mt-3 space-y-1">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Filters component
// ---------------------------------------------------------------------------

interface FiltersProps {
  className?: string;
}

export default function Filters({ className = "" }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const push = useCallback(
    (next: string) => router.push(next ? `/products?${next}` : "/products"),
    [router]
  );

  const toggle = (key: string, value: string) =>
    push(toggleArrayParam(search, key, value));

  const hasAnyFilter =
    searchParams.has("gender") ||
    searchParams.has("size") ||
    searchParams.has("color") ||
    searchParams.has("price");

  return (
    <aside className={`font-jost ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-light-300">
        <span className="text-body-medium font-medium text-dark-900">Filters</span>
        {hasAnyFilter && (
          <button
            type="button"
            className="text-caption text-dark-700 underline underline-offset-2 hover:text-dark-900"
            onClick={() => push(clearFilters(search))}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Gender */}
      <FilterGroup title="Gender">
        {GENDERS.map(({ label, value }) => {
          const active = isParamActive(search, "gender", value);
          return (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggle("gender", value)}
                className="sr-only"
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition
                  ${active
                    ? "bg-dark-900 border-dark-900"
                    : "border-light-400 group-hover:border-dark-700"
                  }`}
              >
                {active && (
                  <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-none stroke-white stroke-2">
                    <polyline points="1 4 4 7 9 1" />
                  </svg>
                )}
              </span>
              <span className={`text-body ${active ? "font-medium text-dark-900" : "text-dark-700"}`}>
                {label}
              </span>
            </label>
          );
        })}
      </FilterGroup>

      {/* Size */}
      <FilterGroup title="Size">
        <div className="grid grid-cols-3 gap-1.5">
          {SIZES.map((size) => {
            const active = isParamActive(search, "size", size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggle("size", size)}
                className={`rounded border px-1 py-1.5 text-caption transition
                  ${active
                    ? "bg-dark-900 border-dark-900 text-light-100 font-medium"
                    : "border-light-400 text-dark-700 hover:border-dark-700"
                  }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Color */}
      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map(({ label, value, hex }) => {
            const active = isParamActive(search, "color", value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggle("color", value)}
                title={label}
                aria-label={label}
                aria-pressed={active}
                className={`relative h-7 w-7 rounded-full border-2 transition
                  ${active ? "border-dark-900 scale-110" : "border-light-300 hover:border-dark-500"}`}
                style={{ backgroundColor: hex }}
              >
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 10 8" className="h-3 w-3 fill-none stroke-white stroke-2">
                      <polyline points="1 4 4 7 9 1" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {COLORS.filter(({ value }) => isParamActive(search, "color", value)).map(({ label, value }) => (
            <span
              key={value}
              className="flex items-center gap-1 rounded-full bg-light-200 px-2 py-0.5 text-caption text-dark-700"
            >
              {label}
              <button
                type="button"
                aria-label={`Remove ${label} filter`}
                onClick={() => toggle("color", value)}
                className="hover:text-dark-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </FilterGroup>

      {/* Price */}
      <FilterGroup title="Price">
        {PRICES.map(({ label, value }) => {
          const active = isParamActive(search, "price", value);
          return (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggle("price", value)}
                className="sr-only"
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition
                  ${active
                    ? "bg-dark-900 border-dark-900"
                    : "border-light-400 group-hover:border-dark-700"
                  }`}
              >
                {active && (
                  <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-none stroke-white stroke-2">
                    <polyline points="1 4 4 7 9 1" />
                  </svg>
                )}
              </span>
              <span className={`text-body ${active ? "font-medium text-dark-900" : "text-dark-700"}`}>
                {label}
              </span>
            </label>
          );
        })}
      </FilterGroup>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Mobile drawer wrapper
// ---------------------------------------------------------------------------

export function FiltersDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-dark-900/50"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-light-100 px-4 py-6 shadow-xl
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Filters drawer"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-heading-3 font-jost font-medium">Filters</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="text-dark-500 hover:text-dark-900 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <Filters />
      </div>
    </>
  );
}
