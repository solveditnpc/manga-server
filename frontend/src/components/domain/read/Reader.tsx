"use client";

import { useState, useRef } from "react";
import { Manga } from "@/types/manga.type";
import { SafeImage } from "@/components/ui";

import PageNavigator from "@/components/domain/read/PageNavigator";
import ReadPageHeader from "@/components/layout/read/ReadPageHeader";
import OverlaysVisibilityControl from "@/components/domain/read/OverlaysVisibilityControl";
import PageZoomControls from "@/components/domain/read/PageZoomControls";

export default function Reader({
  manga,
  pages,
  initialPage = 1,
  chapterTitle,
}: {
  manga: Manga;
  pages: string[];
    initialPage?: number;
    chapterTitle?: string
}) {
  const [zoom, setZoom] = useState(1); // 1 = 100%

  const readerContainer = useRef<HTMLDivElement>(null);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
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
          initialPage={initialPage}
        />

        <PageZoomControls zoom={zoom} setZoom={setZoom} />
      </OverlaysVisibilityControl>
    </div>
  );
}
