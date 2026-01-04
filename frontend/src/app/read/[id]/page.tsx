"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Manga } from "@/types/manga.type";
import mockData from "@/mockData/mangas.json";
import {
  ReadPageZoomControls,
  ReadPageHeader,
  ReadPageOverlaysVisibility,
  ReadPageNavigator,
} from "@/features/read/components";
import { MangaFallback } from "@/config/manga.config";
import { getMockPagesArray } from "@/mockData/mockPages";

export default function MangaReadPage() {
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const params = useParams();
  const manga_id = Number(params.id);

  const mangaMeta: Manga =
    mockData.mangas.find((manga) => manga.manga_id === manga_id) ||
    MangaFallback;

  const readerContainer = useRef<HTMLDivElement>(null);

  const pages = getMockPagesArray(mangaMeta.total_pages);
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
            className="origin-top"
            style={{
              transform: `translateX(-50%) scale(${zoom}) translateX(50%)`,
              width: "max-content",
            }}
          >
            <div
              className="
              w-full
              max-w-225
              sm:max-w-180 
              md:max-w-200
              lg:max-w-225
              px-3 sm:px-4 md:px-6
              py-6 sm:py-8
              flex flex-col
              gap-4 sm:gap-6
            "
            >
              {pages.map((src, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    pageRefs.current[index] = el;
                  }}
                  data-page={index + 1}
                  className="page-wrapper"
                >
                  <img
                    src={src}
                    className="w-full h-auto block select-none"
                    draggable={false}
                  />{" "}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Reader Overlay */}
      <ReadPageOverlaysVisibility readerContainer={readerContainer}>
        <ReadPageHeader
          title={mangaMeta.title}
          author={mangaMeta.author}
          manga_id={manga_id}
        />

        <ReadPageNavigator
          total_pages={mangaMeta.total_pages}
          pageRefs={pageRefs}
        />

        <ReadPageZoomControls zoom={zoom} setZoom={setZoom} />
      </ReadPageOverlaysVisibility>
    </div>
  );
}
