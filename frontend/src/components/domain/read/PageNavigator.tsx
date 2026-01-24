"use client";
import { useState, useEffect, useRef } from "react";
import { clampPage } from "@/utils/pagination.utils";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParam";
export default function PageNavigator({
  total_pages,
  visible,
  pageRefs,
  initialPage,
}: {
  total_pages: number;
  visible?: boolean;
  pageRefs: React.RefObject<(HTMLDivElement | null)[]>;
  initialPage: number;
}) {
  // States and Refs
  const updateSearchParams = useUpdateSearchParams();

  const suppressObserver = useRef(false);
  const [displayPage, setDisplayPage] = useState<string>(String(initialPage));
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const scrollToPage = (page: number, behavior: ScrollBehavior = "smooth") => {
    suppressObserver.current = true;
    pageRefs.current[page - 1]?.scrollIntoView({ behavior });

    const timeout = setTimeout(() => (suppressObserver.current = false), 1000);
    return () => clearTimeout(timeout);
  };

  // Initial scroll
  useEffect(() => scrollToPage(currentPage), []);

  // Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const isBestEntry =
            !bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio;
          if (isBestEntry) bestEntry = entry;
        }

        if (bestEntry && !suppressObserver.current) {
          const page = Number((bestEntry.target as HTMLElement).dataset.page);
          setCurrentPage(page);
        }
      },
      {
        root: null,
        threshold: [0.25, 0.5, 0.75],
      },
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // URL update logic
  useEffect(() => {
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
