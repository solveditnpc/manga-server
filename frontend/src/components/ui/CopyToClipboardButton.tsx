"use client";
import { useState } from "react";
import { CopyIcon } from "lucide-react";
function CopyToClipboardButton({
  displayText,
  copyText,
  successMessage,
}: {
  displayText: string;
  copyText: string;
  successMessage?: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(String(copyText));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="
        hover:fg-primary 
        flex items-center gap-2
        text-sm
        fg-muted
        border border-default
        rounded-xl
        px-2 py-1
        space-x-2
        group-hover:bg-(--card-hover)
      "
      >
        <span>{displayText}</span>
        <div
          className="
            bg-card
            p-0.5
            border border-default 
            rounded-md
            group-hover:bg-(--card-hover)!
          "
        >
          <CopyIcon size={16} />
        </div>
      </button>

      {copied && (
        <span
          className="
          absolute
          text-xs fg-muted 
          w-30 
          -translate-x-1/2 translate-y-1
          left-1/2 
          text-center
          p-1
          bg-card
          rounded-md
          italic
        "
        >
          {successMessage || "Copied"}
        </span>
      )}
    </div>
  );
}

export default CopyToClipboardButton;
