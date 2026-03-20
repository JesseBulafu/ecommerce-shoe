"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { updateProfileImage, removeProfileImage } from "@/lib/actions/profile";

interface ProfileDropdownProps {
  userName: string | null;
  userEmail: string;
  userImage: string | null;
  isAdmin?: boolean;
}

function Avatar({
  src,
  name,
  size = 36,
}: {
  src: string | null;
  name: string | null;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "Profile"}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Initials fallback
  const initials = (name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className="flex items-center justify-center rounded-full bg-violet-600 text-light-100 font-semibold select-none"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}

export default function ProfileDropdown({
  userName,
  userEmail,
  userImage,
  isAdmin = false,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setEditOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("avatar", file);
    startTransition(async () => {
      const res = await updateProfileImage(fd);
      if (!res.success) setError(res.error ?? "Upload failed");
      else {
        setEditOpen(false);
        setOpen(false);
      }
    });
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const res = await removeProfileImage();
      if (!res.success) setError(res.error ?? "Failed");
      else {
        setEditOpen(false);
        setOpen(false);
      }
    });
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Avatar button */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setEditOpen(false);
        }}
        aria-label="Profile menu"
        className="flex items-center justify-center rounded-full ring-2 ring-transparent transition hover:ring-violet-400 focus-visible:ring-violet-500 cursor-pointer"
      >
        <Avatar src={userImage} name={userName} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-light-300 bg-light-100 shadow-lg z-50 overflow-hidden">
          {/* User info header */}
          <div className="flex items-center gap-3 p-4 border-b border-light-300">
            <Avatar src={userImage} name={userName} size={44} />
            <div className="min-w-0">
              {userName && (
                <p className="text-body-medium font-semibold text-dark-900 truncate">
                  {userName}
                </p>
              )}
              <p className="text-caption text-dark-700 truncate">{userEmail}</p>
            </div>
          </div>

          {/* Edit Picture sub-panel */}
          {editOpen ? (
            <div className="p-4 space-y-3">
              <p className="text-body-medium font-semibold text-dark-900">
                Edit Profile Picture
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="block w-full text-sm text-dark-700 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-light-100 file:font-medium file:cursor-pointer hover:file:bg-violet-700"
              />
              {error && (
                <p className="text-caption text-red">{error}</p>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={pending}
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-caption font-medium text-light-100 transition hover:bg-violet-700 disabled:opacity-50 cursor-pointer"
                >
                  {pending ? "Uploading..." : "Upload"}
                </button>
                {userImage && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={pending}
                    className="rounded-lg border border-light-300 px-3 py-1.5 text-caption font-medium text-dark-900 transition hover:bg-light-200 disabled:opacity-50 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditOpen(false);
                    setError(null);
                  }}
                  className="ml-auto text-caption text-dark-700 hover:text-dark-900 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-body-medium text-dark-900 transition hover:bg-light-200 cursor-pointer"
              >
                {/* Camera icon */}
                <svg
                  className="h-5 w-5 text-dark-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Edit Profile Picture
              </button>

              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-body-medium text-dark-900 transition hover:bg-light-200"
              >
                {/* Clock/history icon */}
                <svg
                  className="h-5 w-5 text-dark-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Purchase History
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-body-medium text-dark-900 transition hover:bg-light-200"
                >
                  {/* Shield icon */}
                  <svg
                    className="h-5 w-5 text-dark-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Admin Dashboard
                </Link>
              )}

              <div className="my-1 border-t border-light-300" />

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  startTransition(async () => {
                    await signOut();
                  });
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-body-medium text-red transition hover:bg-light-200 cursor-pointer"
              >
                {/* Logout icon */}
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
