"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCartStore } from "@/store/cart";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileDropdown from "@/components/ProfileDropdown";
import { signOut } from "@/lib/auth/actions";

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

interface NavbarProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
}

export default function Navbar({ isLoggedIn = false, isAdmin = false, userName, userEmail, userImage }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, startSignOut] = useTransition();
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
          <Link
            href="/cart"
            className="text-body-medium font-jost text-dark-900 transition hover:text-dark-700"
          >
            My Cart ({totalItems})
          </Link>
          {isLoggedIn && userEmail ? (
            <ProfileDropdown
              userName={userName ?? null}
              userEmail={userEmail}
              userImage={userImage ?? null}
              isAdmin={isAdmin}
            />
          ) : (
            <Link
              href="/sign-in"
              className="text-caption font-jost text-light-100 bg-dark-900 px-4 py-1.5 rounded-full transition hover:bg-dark-700"
            >
              Sign In
            </Link>
          )}
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
            <Link
              href="/cart"
              className="text-body-medium font-jost text-dark-900"
              onClick={() => setMobileOpen(false)}
            >
              My Cart ({totalItems})
            </Link>
            {isLoggedIn && userEmail ? (
              <div className="rounded-2xl border border-light-300 bg-light-200/50 overflow-hidden">
                {/* Profile header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-light-300">
                  {userImage ? (
                    <Image src={userImage} alt={userName ?? "Profile"} width={40} height={40} className="rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="flex items-center justify-center h-10 w-10 rounded-full bg-violet-600 text-light-100 text-[14px] font-bold shrink-0">
                      {(userName ?? userEmail).charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    {userName && <p className="text-[14px] font-semibold text-dark-900 truncate">{userName}</p>}
                    <p className="text-[12px] text-dark-500 truncate">{userEmail}</p>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-col">
                  <Link href="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[14px] text-dark-900 hover:bg-light-200 transition-colors">
                    <svg className="h-5 w-5 text-dark-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    Purchase History
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[14px] text-dark-900 hover:bg-light-200 transition-colors">
                      <svg className="h-5 w-5 text-dark-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="border-t border-light-300" />
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); startSignOut(async () => { await signOut(); }); }}
                    className="flex items-center gap-3 px-4 py-3 text-[14px] text-red hover:bg-light-200 transition-colors text-left"
                  >
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="text-body-medium font-jost text-light-100 bg-dark-900 px-3 py-1.5 rounded-full text-center"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
