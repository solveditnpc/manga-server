"use client";
import { useEffect, useRef, useState } from "react";

interface DropDownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function Dropdown({
  trigger,
  children,
  disabled,
}: DropDownProps) {
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState<"center" | "left" | "right">("center");

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!open || !menuRef.current) return;
    menuRef.current.focus();
    const rect = menuRef.current.getBoundingClientRect();
    const EDGE_PADDING = 8;

    if (rect.left < EDGE_PADDING) setAlign("left");
    else if (rect.right > window.innerWidth - EDGE_PADDING) setAlign("right");
    else setAlign("center");
  }, [open]);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Avatar */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {trigger}
      </button>

      {/* Dropdown */}
      {!disabled && open && (
        <div
          ref={menuRef}
          tabIndex={-1}
          className={`
            absolute mt-2 z-50
            bg-card border border-default rounded-md p-2
            ${align === "center" && "left-1/2 -translate-x-1/2"}
            ${align === "left" && "left-0"}
            ${align === "right" && "right-0"}
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
}
