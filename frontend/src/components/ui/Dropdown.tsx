"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Align = "center" | "left" | "right";

interface DropDownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  fixedAlign?: Align;
  menuClassName?: string;
}

export default function Dropdown({
  open,
  onOpenChange,
  trigger,
  children,
  disabled,
  fixedAlign,
  menuClassName,
}: DropDownProps) {
  const [align, setAlign] = useState<Align>(fixedAlign ?? "center");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if a node is inside the dropdown menu or trigger
  function isInsideDropdown(node: Node | null) {
    if (!node) return false;
    return (
      menuRef.current?.contains(node) || triggerRef.current?.contains(node)
    );
  }
  // Enforce disabled + auto-alignment
  useLayoutEffect(() => {
    if (!open) return;

    if (disabled) {
      onOpenChange(false);
      return;
    }

    if (fixedAlign) {
      setAlign(fixedAlign);
      return;
    }

    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const EDGE_PADDING = 30;

    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const spaceLeft = triggerRect.left;
    const spaceRight = window.innerWidth - triggerRect.right;

    if (spaceRight < menuRect.width + EDGE_PADDING) setAlign("right");
    else if (spaceLeft < menuRect.width + EDGE_PADDING) setAlign("left");
    else setAlign("center");
  }, [open, disabled, fixedAlign, onOpenChange]);

  // Outside click + Escape
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!isInsideDropdown(e.target as Node)) {
        onOpenChange(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  // Focus lifecycle
  const prevOpenRef = useRef<boolean | null>(null);

  useEffect(() => {
    // open → true
    if (open) menuRef.current?.focus();

    // true → false (closing transition)
    if (prevOpenRef.current === true && !open) {
      triggerRef.current?.focus();
    }

    prevOpenRef.current = open;
  }, [open]);

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => onOpenChange(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-ring rounded-xs"
      >
        {trigger}
      </button>

      {!disabled && open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          onBlur={(e) => {
            if (!isInsideDropdown(e.relatedTarget as Node)) {
              onOpenChange(false);
            }
          }}
          className={`
            absolute z-50 mt-2
            rounded-md border border-default bg-card p-2
            ${align === "center" && "left-1/2 -translate-x-1/2"}
            ${align === "left" && "left-0"}
            ${align === "right" && "right-0"}
            ${menuClassName ?? ""}
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
}
