"use client";
import { useState, useRef, useEffect } from "react";
import { CopyIcon, CopyCheck } from "lucide-react";
import { toast } from "sonner";

interface CopyToClipboardButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  displayText: string;
  copyText: string;
  successMessage?: string;
}

export default function CopyToClipboardButton({
  displayText,
  copyText,
  successMessage = "Copied",
  ...props
}: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const { className = "", ...rest } = props;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(String(copyText));
      setCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${displayText}`}
        className={`
          inline-flex items-center gap-2
          rounded-lg border border-default
          bg-card
          px-2 py-1
          text-sm fg-muted
          transition-colors
          hover:bg-card-hover
          hover:fg-primary
          focus-ring
          cursor-pointer
          ${className}
        `}
        {...rest}
      >
        <span className="truncate">{displayText}</span>

        <span
          className={`
            flex items-center justify-center
            rounded-sm border p-0.5
            transition-all
            ${
              copied
                ? "bg-success fg-success border-transparent"
                : "bg-card border-mid"
            }
          `}
        >
          {copied ? <CopyCheck size={14} /> : <CopyIcon size={14} />}
        </span>
      </button>

      {/* Feedback tooltip */}
      <span
        role="status"
        aria-hidden={!copied}
        className={`
          pointer-events-none
          absolute left-1/2 top-full z-10
          mt-1 -translate-x-1/2
          rounded-md bg-card
          px-2 py-0.5
          text-xs italic fg-muted
          border border-default
          transition-opacity duration-fast
          ${copied ? "opacity-100" : "opacity-0"}
        `}
      >
        {successMessage}
      </span>
    </div>
  );
}
