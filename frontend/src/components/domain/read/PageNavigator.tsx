"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function PageNavigator({
  total_pages,
  visible,
  pageRefs,
}: {
  total_pages: number;
  visible?: boolean;
  pageRefs: React.RefObject<(HTMLDivElement | null)[]>;
}) {
  // Parse Valid Page Number
  function getValidPageNumber(page: number) {
    if (page < 1) return 1;
    if (total_pages > 0 && page > total_pages) return total_pages;
    return page;
  }

  // States and Refs
  const searchParams = useSearchParams();
  const paramsPage = getValidPageNumber(Number(searchParams.get("page")) || 1);

  const router = useRouter();
  const suppressObserver = useRef(false);
  const [pageInputValue, setPageInputValue] = useState<string>(
    String(paramsPage)
  );
  const [currentPage, setCurrentPage] = useState<number>(paramsPage);

  // Initial scroll
  useEffect(() => {
    suppressObserver.current = true;
    pageRefs.current[currentPage - 1]?.scrollIntoView({
      behavior: "auto",
    });
    requestAnimationFrame(() => {
      suppressObserver.current = false;
    });
  }, []);

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
      }
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // URL update logic
  useEffect(() => {
    setPageInputValue(String(currentPage));

    const paramsPage = searchParams.get("page");
    if (paramsPage === String(currentPage)) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(currentPage));

    router.replace(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [currentPage]);

  // Page jump
  const jumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    let jumpPage = Number(pageInputValue);

    if (isNaN(jumpPage)) jumpPage = currentPage;
    else jumpPage = getValidPageNumber(jumpPage);

    setPageInputValue(String(jumpPage));

    suppressObserver.current = true;
    pageRefs.current[jumpPage - 1]?.scrollIntoView({
      behavior: "smooth",
    });
    setTimeout(() => (suppressObserver.current = false), 500);
  };

  // Page Input Events :
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (value === "") {
      setPageInputValue("");
      return;
    }

    if (!/^\d+$/.test(value) || value.length > String(total_pages).length)
      return;

    setPageInputValue(value);
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
      onSubmit={jumpToPage}
    >
      <input
        type="text"
        className="autofit-input"
        style={{ ["--digits" as any]: String(pageInputValue).length }}
        value={pageInputValue}
        onBlur={() => setPageInputValue(String(currentPage))}
        onFocus={(e) => e.target.select()}
        onChange={onChange}
      />
      /{total_pages}
    </form>
  );
}
