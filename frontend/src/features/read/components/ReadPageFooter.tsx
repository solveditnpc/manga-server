"use client";

import { Minus, Plus} from "lucide-react";
import { useEffect } from "react";

type ReadPageFooterProps = {
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  visible?: boolean;
};

export default function ReadPageFooter({
  zoom,
  setZoom,
  visible = true,
}: ReadPageFooterProps) {
  const zoomUp = () => setZoom((z) => Math.min(1.5, z + 0.1));
  const zoomDown = () => setZoom((z) => Math.max(0.8, z - 0.1));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      // Do not react while typing
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "+" || (e.key === "=" && e.shiftKey)) zoomUp();
      if (e.key === "-") zoomDown();
    //   if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 -translate-x-1/2
        z-20
        flex items-center gap-3
        rounded-full
        px-4 py-2
        text-xs fg-primary
        bg-black/80
        transition-opacity duration-200
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      {/* Zoom */}
      <button onClick={zoomDown} className="hover-card px-2 py-1 rounded">
        <Minus size={16} />
      </button>

      <span className="fg-muted w-10 text-center">
        {Math.round(zoom * 100)}%
      </span>

      <button onClick={zoomUp} className="hover-card px-2 py-1 rounded">
        <Plus size={16} />
      </button>
    </div>
  );
}
