"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
type ReadPageHeaderProps = {
  title: string;
  author?: string;
  total_pages?: number;
  visible?: boolean;
  pageRefs: React.RefObject<(HTMLDivElement | null)[]>;
};

export default function ReadPageHeader({
  title,
  author,
  total_pages = 0,
  visible = true,
  pageRefs,
}: ReadPageHeaderProps) {
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get("page")) || 1;

    if (page < 1) return 1;
    if (total_pages > 0 && page > total_pages) return total_pages;

    return page;
  });

  const suppressObserver = useRef(false);

  useEffect(() => {
    suppressObserver.current = true;
    pageRefs.current[currentPage - 1]?.scrollIntoView({
      behavior: "auto",
    });
    requestAnimationFrame(() => {
      suppressObserver.current = false;
    });
  }, []);

  const router = useRouter();
  const pageLabel = `${currentPage} / ${total_pages}`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          if (
            !bestEntry ||
            entry.intersectionRatio > bestEntry.intersectionRatio
          ) {
            bestEntry = entry;
          }
        }

        if (bestEntry && !suppressObserver.current) {
          const page = Number((bestEntry.target as HTMLElement).dataset.page);
          setCurrentPage(page);
        }
      },
      {
        root: null,
        threshold: [0.25, 0.5, 0.75],
      }
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const current = searchParams.get("page");
    if (current === String(currentPage)) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(currentPage));

    router.replace(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [currentPage]);

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
