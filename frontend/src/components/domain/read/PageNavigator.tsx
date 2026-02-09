"use client";
import { useState, useEffect, useRef } from "react";
import { clampPage } from "@/utils/pagination.utils";

export default function PageNavigator({
  currentPage,
  total_pages,
  visible,
  pageRefs,
  readerContainer,
  onPageChange,
  onPageJump,
}: {
  currentPage: number;
  total_pages: number;
  visible?: boolean;
  pageRefs: React.RefObject<(HTMLDivElement | null)[]>;
  readerContainer: React.RefObject<HTMLDivElement | null>;
  onPageChange?: (page: number) => void;
  onPageJump?: (page: number) => void;
}) {
  // States and Refs
  const [displayPage, setDisplayPage] = useState<string>(String(currentPage));

  const visiblePagesRef = useRef<Set<number>>(new Set());

  function updatePage(page: number) {
    page = clampPage(page, total_pages, 1);
    setDisplayPage(String(page));
    onPageChange?.(page);
  }

  // Page jump
  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const jumpPage = clampPage(displayPage, total_pages, currentPage);
    setDisplayPage(String(jumpPage));
    onPageJump?.(jumpPage);
  };

  function getDominantPage(): number | null {
    const container = readerContainer.current;
    if (!container) return null;
    const containerRect = container.getBoundingClientRect();
    const viewportHeight = container.clientHeight;
    const viewportMid = viewportHeight / 2;

    let dominantPage: number | null = null;

    for (const page of visiblePagesRef.current) {
      const el = pageRefs.current[page - 1];
      if (!el) continue;

      const rect = el.getBoundingClientRect();

      // normalize page rect relative to container
      const top = rect.top - containerRect.top;
      const bottom = rect.bottom - containerRect.top;

      // completely outside

      if (bottom <= 0 || top >= viewportHeight) continue;

      // check if mid of viewport is inside this page, then this is the dominant page

      if (top <= viewportMid && bottom >= viewportMid) {
        dominantPage = page;
      }
    }

    return dominantPage;
  }

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      const dominantPage = getDominantPage();
      if (dominantPage !== null) updatePage(dominantPage);
      ticking = false;
    };

    readerContainer.current?.addEventListener("scroll", onScroll, {
      passive: true,
    });
    return () =>
      readerContainer.current?.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // observer will check the visibility of pages and maintain a set of visible pages
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // calculate the page number of entry
          const page = Number((entry.target as HTMLElement).dataset.page);

          // if the page is entering the viewport
          if (entry.isIntersecting) {
            // add it to visible pages if not present
            if (!visiblePagesRef.current.has(page))
              visiblePagesRef.current.add(page);
          } else {
            // remove it from visible pages as it is leaving the viewport
            if (visiblePagesRef.current.delete(page)) {
            }
          }
        }
      },
      {
        root: null,
        threshold: 0,
      },
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Page Input Events :
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value && (!/^\d+$/.test(value) || Number(value) > total_pages)) return;
    setDisplayPage(value);
  };

  return (
    <form
      className={`
          fixed z-20  
          top-3 right-4 
          text-sm fg-muted select-none 
          py-2 px-3 rounded-full 
          transition-bg duration-200
          ${visible ? "bg-transparent" : "bg-black/80 "}
        `}
      onSubmit={handleJump}
    >
      <input
        type="text"
        className="autofit-input"
        style={{ ["--digits" as any]: String(displayPage).length }}
        value={displayPage}
        onBlur={() => setDisplayPage(String(currentPage))}
        onFocus={(e) => e.target.select()}
        onChange={onChange}
      />
      /{total_pages}
    </form>
  );
}
