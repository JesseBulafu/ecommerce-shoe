"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCartStore } from "@/store/cart";
import { useTheme } from "@/components/ThemeProvider";

function ArstraLogo({ className }: { className?: string }) {
  return (
    <svg width="140" height="32" viewBox="0 0 180 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 32 L18 22 L28 32" stroke="#7C3AED" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M18 22 L18 8 L34 8" stroke="#7C3AED" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M34 8 L26 16" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <text x="46" y="28" fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" fontSize="22" fontWeight="800" letterSpacing="2" fill="currentColor">ARSTRA</text>
    </svg>
  );
}

const navLinks = [
  { label: "Men", href: "/products?gender=men" },
  { label: "Women", href: "/products?gender=women" },
  { label: "Kids", href: "/products?gender=unisex" },
  { label: "Collections", href: "/collections" },
  { label: "Contact", href: "/contact" },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="relative flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-light-300"
    >
      {/* Sun icon */}
      <svg
        className={`absolute h-5 w-5 transition-all duration-300 ${
          theme === "light" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      {/* Moon icon */}
      <svg
        className={`absolute h-5 w-5 transition-all duration-300 ${
          theme === "light" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
      </svg>
    </button>
  );
}

interface NavbarProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

export default function Navbar({ isLoggedIn = false, isAdmin = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!headerRef.current) return;

    gsap.from(headerRef.current, {
      y: -80,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    const links = headerRef.current.querySelectorAll(".nav-link");
    if (links.length) {
      gsap.fromTo(links,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.3, ease: "power2.out" },
      );
    }
  }, { scope: headerRef });

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-light-100 border-b border-light-300 transition-colors duration-300">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Primary navigation"
      >
        {/* Logo */}
        <Link href="/" aria-label="Home" className="text-dark-900">
          <ArstraLogo />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="nav-link text-body-medium font-jost text-dark-900 transition hover:text-dark-700"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Search"
            className="text-body-medium font-jost text-dark-900 transition hover:text-dark-700"
          >
            Search
          </button>
          {isLoggedIn && (
            <Link
              href="/orders"
              className="text-body-medium font-jost text-dark-900 transition hover:text-dark-700"
            >
              My Orders
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-caption font-jost text-light-100 bg-dark-900 px-3 py-1.5 rounded-full transition hover:bg-dark-700"
            >
              Admin
            </Link>
          )}
          <Link
            href="/cart"
            className="text-body-medium font-jost text-dark-900 transition hover:text-dark-700"
          >
            My Cart ({totalItems})
          </Link>
        </div>

        {/* Mobile right: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="flex flex-col gap-1.5 p-2"
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
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-light-300 bg-light-100 px-4 pb-6 transition-colors duration-300">
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
            {isLoggedIn && (
              <Link
                href="/orders"
                className="text-body-medium font-jost text-dark-900"
                onClick={() => setMobileOpen(false)}
              >
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-body-medium font-jost text-light-100 bg-dark-900 px-3 py-1.5 rounded-full text-center"
                onClick={() => setMobileOpen(false)}
              >
                Admin
              </Link>
            )}
            <Link
              href="/cart"
              className="text-body-medium font-jost text-dark-900"
              onClick={() => setMobileOpen(false)}
            >
              My Cart ({totalItems})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
