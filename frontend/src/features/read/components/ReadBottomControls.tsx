type ReadBottomControlsProps = {
  mode: "scroll" | "slide";
  onModeToggle: () => void;
  zoom: number;
  setZoom: (z: number) => void;
  visible: boolean;
};

export default function ReadBottomControls({
  mode,
  onModeToggle,
  zoom,
  setZoom,
  visible,
}: ReadBottomControlsProps) {
  return (
    <div
      className={`
        fixed bottom-4 left-1/2 -translate-x-1/2
        z-20
        bg-card/80 backdrop-blur
        border border-default
        rounded-full
        px-4 py-2
        flex items-center gap-3
        text-xs fg-primary
        transition-opacity duration-200
        bg-black/80
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      {/* Mode Toggle */}
      <button onClick={onModeToggle} className="hover-card px-2 py-1 rounded">
        {mode === "scroll" ? "Scroll" : "Slide"}
      </button>

      <div className="w-px h-4 bg-border" />

      {/* Zoom Controls */}
      <button
        onClick={() => setZoom(Math.max(0.8, zoom - 0.1))}
        className="hover-card px-2 py-1 rounded"
      >
        –
      </button>

      <span className="fg-muted w-10 text-center">
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
        className="hover-card px-2 py-1 rounded"
      >
        +
      </button>
    </div>
  );
}
