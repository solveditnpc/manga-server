"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Manga } from "@/types/manga.type";
import mockData from "@/mockData/mangas.json";
import {
  ReadPageFooter,
  ReadPageHeader,
  ReadPageOverlayController,
} from "@/features/read/components";
import { FitMode } from "@/types/read.types";
import { MangaFallback } from "@/config/manga.config";

export default function MangaReadPage() {
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const params = useParams();
  const manga_id = Number(params.id);

  const mangaMeta: Manga =
    mockData.mangas.find((manga) => manga.manga_id === manga_id) ||
    MangaFallback;

  const readerContainer = useRef<HTMLDivElement>(null);

  const DummyReaderPage = ({ page }: { page: number }) => (
    <div style={{ transform: `scale(${zoom})` }}>
      <div
        className={`
        flex flex-col gap-5 
        items-center justify-center 
        aspect-2/3 h-screen
        bg-card border-2 border-white/50
        `}
      >
        <span>READER-PAGE-{page}</span>
      </div>
    </div>
  );

  return (
    <div className="reader min-h-screen relative overflow-hidden">
      <ReadPageOverlayController readerContainer={readerContainer}>
        <ReadPageHeader
          title={mangaMeta.title}
          author={mangaMeta.author}
          total_pages={mangaMeta.total_pages}
        />
        <ReadPageFooter zoom={zoom} setZoom={setZoom} manga_id={manga_id} />
      </ReadPageOverlayController>

      {/* Reader Viewport */}
      <main
        ref={readerContainer}
        className="h-screen overflow-y-auto flex flex-col items-center"
      >
        {Array.from({ length: mangaMeta.total_pages }, (_, i) => (
          <DummyReaderPage key={i} page={i + 1} />
        ))}
      </main>
    </div>
  );
}
