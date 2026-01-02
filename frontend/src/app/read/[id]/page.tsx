"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Manga } from "@/types/manga.type";
import mockData from "@/mockData/mangas.json";
import {
  ReadPageFooter,
  ReadPageHeader,
  ReadPageOverlayController,
  ReadPageNavigator,
} from "@/features/read/components";
import { FitMode } from "@/types/read.types";
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
    <div className="reader min-h-screen relative overflow-hidden">
      {/* Reader Viewport */}
      <main
        ref={readerContainer}
        className="h-screen overflow-y-auto flex flex-col items-center"
      >
        <div className="mx-auto max-w-225 px-4 py-8 flex flex-col gap-6">
          {pages.map((src, index) => (
            <div
              key={index}
              ref={(el) => {
                pageRefs.current[index] = el;
              }}
              data-page={index + 1}
              className="page-wrapper"
            >
              <img src={src} />
            </div>
          ))}
        </div>
      </main>

      {/* Reader Overlay */}
      <ReadPageOverlayController readerContainer={readerContainer}>
        <ReadPageHeader title={mangaMeta.title} author={mangaMeta.author} />

        <ReadPageNavigator
          total_pages={mangaMeta.total_pages}
          pageRefs={pageRefs}
        />

        <ReadPageFooter zoom={zoom} setZoom={setZoom} manga_id={manga_id} />
      </ReadPageOverlayController>
    </div>
  );
}
