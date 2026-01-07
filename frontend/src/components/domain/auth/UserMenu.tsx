"use client";

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/domain/auth/LogoutButton";
import { Button } from "../../ui";

export default function UserMenu() {
  const username = Cookies.get("username");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logged-out state → Login button only
  if (!username) {
    return <Button onClick={() => router.push("/auth")}>Login</Button>;
  }

  const initial = username.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          w-8 h-8
          rounded-full
          bg-card
          border border-default
          flex items-center justify-center
          text-sm font-medium
          fg-primary
          hover-card
          focus-ring
        "
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-1/2 mt-2
            transform translate-x-1/2
            bg-card
            border border-default
            rounded-md
            z-50
            flex flex-col items-center gap-1
            p-2
          "
        >
          <div className="text-sm fg-primary truncate">{username}</div>
          <div className="border-t border-default w-full"></div>
          <LogoutButton />
        </div>
      )}
    </div>
  );
}
