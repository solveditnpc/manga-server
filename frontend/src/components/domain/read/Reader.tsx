"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";

import { SafeImage } from "@/components/ui";
import PageNavigator from "@/components/domain/read/PageNavigator";
import ReadPageHeader from "@/components/layout/read/ReadPageHeader";
import OverlaysVisibilityControl from "@/components/domain/read/OverlaysVisibilityControl";
import PageZoomControls from "@/components/domain/read/PageZoomControls";
import { useServerContext } from "@/components/domain/server/ServerContext";

import { saveProgress } from "@/server/manga/manga.action";
import { ContinueProgress, FullContinueManga } from "@/types/manga.type";
import { getProgress, clampCheckpoint } from "@/utils/reader.utils";
import { useSearchParams } from "next/navigation";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParam";

export default function Reader({
  manga,
  pages,
  chapterTitle = "",
}: {
  manga: FullContinueManga;
  pages: string[];
  chapterTitle?: string;
}) {
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const [currentPage, setCurrentPage] = useState(1);
  const { server } = useServerContext();
  const urlPage = Number(useSearchParams().get("page"));
  const updateSearchParams = useUpdateSearchParams();

  const lastProgress = useRef<ContinueProgress>(
    manga.progress ?? {
      chapter: chapterTitle,
      checkpoint: 0,
      page: 1,
      currTotalPages: pages.length,
    },
  );
  const nextProgress = useRef<ContinueProgress | null>(null);
  const progressCommitTimer = useRef<NodeJS.Timeout | null>(null);
  const readerContainer = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentPageRef = useRef<number>(urlPage);
  const urlChangeCommitTimer = useRef<NodeJS.Timeout | null>(null);

  // ===================  Progress Tracking  ===================
  function commitSaveProgress() {
    if (!nextProgress.current) return;

    if (progressCommitTimer.current) {
      clearTimeout(progressCommitTimer.current);
      progressCommitTimer.current = null;
    }

    lastProgress.current = nextProgress.current;
    nextProgress.current = null;

    saveProgress({
      manga_id: manga.manga_id,
      progress: lastProgress.current,
      server,
    });
  }

  useEffect(() => {
    function onScroll() {
      const currentPage = currentPageRef.current;
      const pageRef = pageRefs.current[currentPage - 1];

      if (!pageRef) return;
      const progress = getProgress(pageRef);
      const nextCheckpoint = clampCheckpoint(progress);

      if (
        lastProgress.current.page > currentPage ||
        (lastProgress.current.page === currentPage &&
          lastProgress.current.checkpoint >= nextCheckpoint)
      )
        return;

      nextProgress.current = {
        checkpoint: nextCheckpoint,
        page: currentPage,
        chapter: chapterTitle,
        currTotalPages: pages.length,
      };

      progressCommitTimer.current = setTimeout(
        () => commitSaveProgress(),
        3000,
      ); // 3s dwell
    }

    const reader = readerContainer.current;
    if (!reader) return;
    reader.addEventListener("scroll", onScroll);
    return () => {
      reader.removeEventListener("scroll", onScroll);
    };
  }, []);

  // ===================  Navigation actions ===================
  function onPageChange(page: number) {
    setCurrentPage(page);
    currentPageRef.current = page;

    if (urlChangeCommitTimer.current)
      clearTimeout(urlChangeCommitTimer.current);

    if (page === urlPage) return;

    urlChangeCommitTimer.current = setTimeout(() => {
      updateSearchParams({ page: String(page) });
      urlChangeCommitTimer.current = null;
    }, 500);
  }

  function scrollToPage(
    page: number,
    checkpoint = 0,
    behavior: ScrollBehavior = "instant",
  ) {
    const container = readerContainer.current;
    const el = pageRefs.current[page - 1];
    if (!container || !el) return;

    const pageTop = el.offsetTop;
    const pageHeight = el.offsetHeight;
    const viewportHeight = container.clientHeight;

    const scrollable = Math.max(0, pageHeight - viewportHeight);
    const target = pageTop + checkpoint * scrollable;

    container.scrollTo({
      top: target,
      behavior, // always auto for correctness
    });

    onPageChange(page);
  }

  // ===================  First render effects ===================

  useEffect(() => {
    if (urlPage !== currentPageRef.current) onPageChange(urlPage);
  }, []);

  useLayoutEffect(() => {
    const initialPage = urlPage || manga.progress?.page || 1;
    const initialCheckpoint =
      initialPage === manga.progress?.page
        ? (manga.progress?.checkpoint ?? 0)
        : 0;

    const container = readerContainer.current;
    const el = pageRefs.current[initialPage - 1];
    if (!container || !el) return;

    let lastHeight = 0;
    const check = () => {
      const h = el.offsetHeight;
      if (h > 0 && h === lastHeight) {
        scrollToPage(initialPage, initialCheckpoint, "instant");
      } else {
        lastHeight = h;
        requestAnimationFrame(check);
      }
    };

    check();
  }, []);

  return (
    <div className="reader min-h-screen relative">
      {/* Reader Viewport */}
      <main
        ref={readerContainer}
        className="h-screen overflow-auto overscroll-contain"
      >
        <div className="flex justify-center items-center">
          <div
            style={{
              transform: `translateX(-50%) scale(${zoom}) translateX(50%)`,
              width: "max-content",
              transformOrigin: "top",
            }}
          >
            <div
              className="
                w-full flex flex-col
                max-w-225 px-3 py-6 gap-1
                sm:max-w-180 sm:px-4 sm:py-8
                md:max-w-200 md:px-6 
                lg:max-w-225
                "
            >
              {pages.map((src, index) => {
                const pageNumber = index + 1;

                // Preload window of 5 images : 2 prev + 1 curr + 2 ahead
                const isNear = Math.abs(pageNumber - currentPage) <= 2;
                return (
                  <div
                    key={pageNumber}
                    ref={(el) => {
                      pageRefs.current[index] = el;
                    }}
                    data-page={pageNumber}
                    className="w-full h-full select-none"
                  >
                    <SafeImage
                      src={src}
                      alt={`Page ${pageNumber}`}
                      width={900} // nominal width (design width)
                      height={1200} // fake / nominal height
                      sizes="(max-width: 768px) 100vw, 900px"
                      style={{ height: "auto" }}
                      loading={isNear ? "eager" : "lazy"}
                      decoding="async"
                      quality={85}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Reader Overlay */}
      <OverlaysVisibilityControl readerContainer={readerContainer}>
        <ReadPageHeader
          title={manga.title}
          author={manga.author}
          chatperTitle={chapterTitle}
          manga_id={manga.manga_id}
        />

        <PageNavigator
          total_pages={pages.length}
          pageRefs={pageRefs}
          currentPage={currentPageRef.current}
          onPageChange={onPageChange}
          readerContainer={readerContainer}
          onPageJump={scrollToPage}
        />

        <PageZoomControls zoom={zoom} setZoom={setZoom} />
      </OverlaysVisibilityControl>
    </div>
  );
}
