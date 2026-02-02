"use client";

import { useState, useRef, useEffect } from "react";

import { SafeImage } from "@/components/ui";
import PageNavigator from "@/components/domain/read/PageNavigator";
import ReadPageHeader from "@/components/layout/read/ReadPageHeader";
import OverlaysVisibilityControl from "@/components/domain/read/OverlaysVisibilityControl";
import PageZoomControls from "@/components/domain/read/PageZoomControls";

import { saveProgress } from "@/server/manga/manga.action";
import { clampCheckpoint } from "@/utils/mangas.utils";
import { ContinueProgress, FullContinueManga } from "@/types/manga.type";

function getProgress(pageEl: HTMLElement): number {
  const rect = pageEl.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  const totalScrollable = rect.height - viewportHeight;
  if (totalScrollable <= 0) return 1;

  const scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);

  return scrolled / totalScrollable;
}

export default function Reader({
  manga,
  pages,
  urlPage = 1,
  chapterTitle = "",
}: {
  manga: FullContinueManga;
  pages: string[];
  urlPage?: number;
  chapterTitle?: string;
}) {
  const [zoom, setZoom] = useState(1); // 1 = 100%

  const readerContainer = useRef<HTMLDivElement>(null);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  let lastProgress = useRef<ContinueProgress>(manga.progress);
  let nextProgress = useRef<ContinueProgress | null>(null);
  let commitTimer = useRef<NodeJS.Timeout | null>(null);

  function commitSaveProgress(source: string) {
    console.log(source);
    
    if (!nextProgress.current) return;

    if (commitTimer.current) {
      clearTimeout(commitTimer.current);
      commitTimer.current = null;
    }
    const { checkpoint, page, chapter, currTotalPages } = nextProgress.current;
    console.log("WROTE : \n", nextProgress.current);

    lastProgress.current = nextProgress.current;
    nextProgress.current = null;

    saveProgress({
      manga_id: manga.manga_id,
      progress: { chapter, page, checkpoint, currTotalPages },
      server: "S",
    });
  }

  // Current Page Ref :
  const currentPageRef = useRef<number>(urlPage);
  useEffect(() => {
    currentPageRef.current = urlPage;
  }, [urlPage]);

  // Scroll Progress Logic :
  function proceedToCommit(progress: number) {
    const nextCheckpoint = clampCheckpoint(progress);

    const { checkpoint: lastCheckpoint, page: lastPage } = lastProgress.current;
    const currentPage = currentPageRef.current;

    if (
      lastPage > currentPage ||
      (lastPage === currentPage && lastCheckpoint >= nextCheckpoint)
    )
      return;

    if (commitTimer.current) clearTimeout(commitTimer.current);

    nextProgress.current = {
      checkpoint: nextCheckpoint,
      page: currentPage,
      chapter: chapterTitle,
      currTotalPages: pages.length,
    };
    
    commitTimer.current = setTimeout(() => commitSaveProgress("Scroll Timer"), 3000); // 3s dwell
  }

  useEffect(() => {
    function onScroll() {
      const currentPage = currentPageRef.current;
      const pageRef = pageRefs.current[currentPage - 1];

      if (!pageRef) return;
      const progress = getProgress(pageRef);
      proceedToCommit(progress);
    }

    const container = readerContainer.current;
    if (!container) return;
    container.addEventListener("scroll", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Save Progress on Visibility Change
  useEffect(() => {
    const handler = () => {
      console.log("Here 1");
      if (document.hidden) commitSaveProgress("Visibility Change");
    };

    document.addEventListener("visibilitychange", handler);

    return () => {
      document.removeEventListener("visibilitychange", handler);
      console.log("Here 2");

      commitSaveProgress("Visibility Change - 2");
    };
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
                max-w-225 px-3 py-6 gap-4
                sm:max-w-180 sm:px-4 sm:py-8 sm:gap-6
                md:max-w-200 md:px-6 
                lg:max-w-225
                "
            >
              {pages.map((src, index) => {
                const pageNumber = index + 1;

                return (
                  <div
                    key={pageNumber} // stable, semantic key
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
                      loading="lazy"
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
          initialPage={urlPage}
          initialCheckpoint={manga.progress?.checkpoint || 0}
        />

        <PageZoomControls zoom={zoom} setZoom={setZoom} />
      </OverlaysVisibilityControl>
    </div>
  );
}
