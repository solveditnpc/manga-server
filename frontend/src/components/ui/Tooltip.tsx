import { Info } from "lucide-react";

interface TooltipProps {
  message: React.ReactNode;
  children?: React.ReactNode;
}
export default function Tooltip({ children, message }: TooltipProps) {
  return (
    <span className="relative inline-block group cursor-help">
      {/* Trigger */}
      {children || <Info size={16} className="ml-1 stroke-muted" />}
      {/* Tooltip */}
      <span
        className="
          pointer-events-none absolute left-1/2 top-full z-10
          mt-2 w-56 -translate-x-1/2
          rounded-md bg-card border border-default
          px-3 py-2 text-xs fg-secondary
          opacity-0 group-hover:opacity-100
          transition-opacity
        "
      >
        {message}
      </span>
    </span>
  );
}
