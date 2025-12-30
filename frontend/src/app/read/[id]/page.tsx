"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import ReadPageOverlays from "@/features/read/components/ReadPageOverlays";
import { Manga } from "@/types/manga.type";
import mockData from "@/mockData/mangas.json";

export default function MangaReadPage() {
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const params = useParams();
  const manga_id = Number(params.id);

  const mangaMeta: Manga = mockData.mangas.find(
    (manga) => manga.manga_id === manga_id
  ) || {
    manga_id: 0,
    title: "Manga Not Found (404)",
    author: "Unknown Author",
    cover_url: "",
    tags: [],
    total_pages: 0,
    likes_count: 0,
    language: "N/A",
  };

  const readerContainer = useRef<HTMLDivElement>(null);

  const DummyReaderPage = ({ page }: { page: number }) => (
    <div style={{ transform: `scale(${zoom})` }}>
      <div
        className="
        flex flex-col gap-5 
        items-center justify-center 
        h-screen aspect-2/3
        bg-card border border-default
        "
      >
        <span>READER-PAGE-{page}</span>
      </div>
    </div>
  );

  return (
    <div className="reader min-h-screen relative overflow-hidden">
      <ReadPageOverlays
        mangaMeta={mangaMeta}
        zoom={zoom}
        setZoom={setZoom}
        readerContainer={readerContainer}
      />
      {/* Reader Viewport */}
      <main
        className="overflow-y-auto h-screen overflow-auto flex items-center flex-col"
        ref={readerContainer}
      >
        {[...Array(mangaMeta.total_pages)].map((_, i) => (
          <DummyReaderPage key={i} page={i + 1} />
        ))}
      </main>
    </div>
  );
}
