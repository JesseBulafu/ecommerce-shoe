"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Men", href: "/men" },
  { label: "Women", href: "/women" },
  { label: "Kids", href: "/kids" },
  { label: "Collections", href: "/collections" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-light-100 border-b border-light-300">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Primary navigation"
      >
        {/* Logo */}
        <Link href="/" aria-label="Home">
          <Image
            src="/logo.svg"
            alt="Nike"
            width={70}
            height={24}
            priority
            className="dark:invert-0"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-body-medium font-jost text-dark-900 transition hover:text-dark-700"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-6">
          <button
            type="button"
            aria-label="Search"
            className="text-body-medium font-jost text-dark-900 transition hover:text-dark-700"
          >
            Search
          </button>
          <Link
            href="/cart"
            className="text-body-medium font-jost text-dark-900 transition hover:text-dark-700"
          >
            My Cart (2)
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span
            className={`block h-0.5 w-6 bg-dark-900 transition-transform ${
              mobileOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-dark-900 transition-opacity ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-dark-900 transition-transform ${
              mobileOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-light-300 bg-light-100 px-4 pb-6">
          <ul className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-body-medium font-jost text-dark-900 transition hover:text-dark-700"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-4 border-t border-light-300 pt-4">
            <button
              type="button"
              className="text-body-medium font-jost text-dark-900 text-left"
            >
              Search
            </button>
            <Link
              href="/cart"
              className="text-body-medium font-jost text-dark-900"
              onClick={() => setMobileOpen(false)}
            >
              My Cart (2)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
