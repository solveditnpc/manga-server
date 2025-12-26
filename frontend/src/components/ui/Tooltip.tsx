import { ReactNode } from "react";

export default function Tooltip({ message }: { message: ReactNode }) {
  return (
    <span className="relative inline-block group">
      {/* Trigger */}
      <span
        tabIndex={0}
        className="
          ml-1 inline-flex h-4 w-4 items-center justify-center
          rounded-full border border-lighter
          text-[10px] fg-secondary
          cursor-help
          focus-ring
        "
      >
        ?
      </span>

      {/* Tooltip */}
      <span
        className="
          pointer-events-none absolute left-1/2 top-full z-10
          mt-2 w-56 -translate-x-1/2
          rounded-md bg-card border border-default
          px-3 py-2 text-xs fg-secondary
          opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
          transition-opacity
        "
      >
        {message}
      </span>
    </span>
  );
}
