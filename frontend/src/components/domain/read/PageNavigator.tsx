"use client";
import { useState, useEffect, useRef } from "react";
import { clampPage } from "@/utils/pagination.utils";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParam";
import { ContinueProgress } from "@/types/manga.type";

export default function PageNavigator({
  total_pages,
  visible,
  pageRefs,
  initialPage,
  initialCheckpoint,
  onPageChange,
  readerContainer,
}: {
  total_pages: number;
  visible?: boolean;
  pageRefs: React.RefObject<(HTMLDivElement | null)[]>;
  initialPage: number;
  initialCheckpoint: ContinueProgress["checkpoint"];
  onPageChange?: (page: number) => void;
  readerContainer: React.RefObject<HTMLDivElement | null>;
}) {
  // States and Refs
  const updateSearchParams = useUpdateSearchParams();

  const suppressObserver = useRef(false);
  const [displayPage, setDisplayPage] = useState<string>(String(initialPage));
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  function scrollToPage(page: number) {
    const el = pageRefs.current[page - 1];
    if (!el) return;

    suppressObserver.current = true;

    el.scrollIntoView({ behavior: "smooth" });

    requestAnimationFrame(() => {
      suppressObserver.current = false;
      selectCurrentPage();
    });
  }

  // Initial scroll
  useEffect(() => {
    suppressObserver.current = true;

    // Scroll to page (no animation)
    pageRefs.current[currentPage - 1]?.scrollIntoView({ behavior: "auto" });

    // Wait for layout + image decode
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (initialCheckpoint && initialCheckpoint > 0) {
          const el = pageRefs.current[currentPage - 1];
          if (!el) return;

          const rect = el.getBoundingClientRect();
          const viewportHeight = window.innerHeight;

          const totalScrollable = rect.height - viewportHeight;
          if (totalScrollable <= 0) return;

          const targetScroll =
            window.scrollY + rect.top + initialCheckpoint * totalScrollable;

          window.scrollTo({ top: targetScroll, behavior: "auto" });
        }

        // Re-enable observer after restore
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            suppressObserver.current = false;
            selectCurrentPage();
          });
        });
      });
    });
  }, []);

  // Observer
  const visiblePagesRef = useRef<Set<number>>(new Set());

  function selectCurrentPage() {
    const viewportHeight = window.innerHeight;
    const viewportMid = viewportHeight / 2;

    let ownerPage: number | null = null;
    let dominantPage: number | null = null;
    let maxVisibleHeight = 0;

    for (const page of visiblePagesRef.current) {
      const el = pageRefs.current[page - 1];
      if (!el) continue;

      const rect = el.getBoundingClientRect();

      // completely outside
      if (rect.bottom <= 0 || rect.top >= viewportHeight) continue;

      // 1️⃣ Ownership rule (hard switch)
      if (rect.top <= viewportMid && rect.bottom >= viewportMid) {
        ownerPage = page;
      }

      // 2️⃣ Dominance rule (soft switch)
      const visibleHeight =
        Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        dominantPage = page;
      }
    }

    // Decision priority
    const nextPage = ownerPage ?? dominantPage;
    if (nextPage !== null) {
      setCurrentPage(nextPage);
    }
  }

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        if (!suppressObserver.current) {
          selectCurrentPage();
        }
        ticking = false;
      });
    };

    console.log(readerContainer);

    readerContainer.current?.addEventListener("scroll", onScroll, {
      passive: true,
    });
    return () =>
      readerContainer.current?.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // observer will just check the visibility of pages and maintain a list of visible pages
    const observer = new IntersectionObserver(
      (entries) => {
        // this will keep track if there is any change in visible pages like new page enter or a page leave viewport
        let visibilityChanged = false;

        for (const entry of entries) {
          // calculate the page number of entry
          const page = Number((entry.target as HTMLElement).dataset.page);

          // if the page is entering the viewport
          if (entry.isIntersecting) {
            // add it to visible pages if not present
            if (!visiblePagesRef.current.has(page)) {
              visiblePagesRef.current.add(page);
              visibilityChanged = true;
            }
          } else {
            // remove it from visible pages as it is leaving the viewport
            if (visiblePagesRef.current.delete(page)) {
              visibilityChanged = true;
            }
          }
        }
        // if visibility changed then again run best-current-page-selector
        if (visibilityChanged && !suppressObserver.current) selectCurrentPage();
      },
      {
        root: null,
        threshold: 0,
      },
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // URL update logic
  useEffect(() => {
    onPageChange?.(currentPage);
    setDisplayPage(String(currentPage));

    const debounce = setTimeout(
      () => updateSearchParams({ page: String(currentPage) }),
      1000,
    );
    return () => clearTimeout(debounce);
  }, [currentPage]);

  // Page jump
  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    let jumpPage = clampPage(displayPage, total_pages, currentPage);
    setDisplayPage(String(jumpPage));
    scrollToPage(jumpPage);
  };

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
