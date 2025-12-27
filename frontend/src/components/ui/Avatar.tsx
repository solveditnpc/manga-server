"use client";
import Cookies from "js-cookie";

export default function Avatar() {
  const username = Cookies.get("username") || "Guest";
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="relative group">
      {/* Avatar circle */}
      <div
        tabIndex={0}
        className="
          w-8 h-8
          rounded-full
          bg-card hover-card
          border border-default
          flex items-center justify-center
          text-sm font-medium
          fg-primary
          cursor-default
          focus-ring
        "
        aria-label={`User: ${username}`}
      >
        {initial}
      </div>

      {/* Hover / Focus label */}
      <div
        className="
          pointer-events-none
          absolute
          right-1/2
          translate-x-1/2
          mt-2
          opacity-0
          translate-y-1
          transition-transform
          group-hover:opacity-100
          group-hover:translate-y-0
          group-focus-within:opacity-100
          group-focus-within:translate-y-0
        "
      >
        <div
          className="
            bg-card
            border border-default
            rounded-md
            px-3 py-1.5
            text-sm
            fg-primary
            whitespace-nowrap
          "
        >
          {username}
        </div>
      </div>
    </div>
  );
}
