"use client";
import { useSearchParams } from "next/navigation";
type ReadPageHeaderProps = {
  title: string;
  author?: string;
  total_pages?: number;
  visible?: boolean;
};

export default function ReadPageHeader({
  title,
  author,
  total_pages = 0,
  visible = true,
}: ReadPageHeaderProps) {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLabel = `${page} / ${total_pages}`;

  return (
    <div className="fixed top-0 left-0 right-0 z-10">
      <div
        className={`
          h-15
          px-4
          flex items-center justify-between
          bg-black/80
          border-b border-default
          text-xs
          transition-opacity duration-200
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Left: Manga Info */}
        <div className="flex flex-col overflow-hidden">
          <h1 className="fg-primary text-lg truncate max-w-[70vw]">{title}</h1>
          <span className="fg-muted truncate">{author}</span>
        </div>

        {/* Right: Page Info */}
        {/* <span className="fg-muted whitespace-nowrap">{pageLabel}</span> */}
      </div>

      {/* Top-Right Page Indicator */}
      <div
        className={`
          fixed z-20  
          top-3 right-4 
          text-sm fg-muted select-none 
          py-2 px-3 rounded-full 
          transition-bg duration-200
          ${visible ? "bg-transparent" : "bg-black/80 "}
        `}
      >
        {pageLabel}
      </div>
    </div>
  );
}
