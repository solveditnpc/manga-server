"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ReadBottomControls,
  ReadTopInfoOverlay,
} from "@/features/read/components";
import { Button } from "@/components/ui";

type ReaderMode = "scroll" | "slide";
import mockData from "@/mockData/mangas.json";

export default function MangaReadPage() {
  const [mode, setMode] = useState<ReaderMode>("scroll");
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const [showUI, setShowUI] = useState(true);
  const params = useParams();
  const manga_id = Number(params.id);

  const {
    total_pages = 0,
    title = "Manga Not Found (404)",
    author = "Unknown Author",
  } = mockData.mangas.find((manga) => manga.manga_id === manga_id) || {};
    
  return (
    <div className="reader min-h-screen relative overflow-hidden">
      {/* Top Info Overlay */}
      <ReadTopInfoOverlay
        title={title}
        author={author}
        visible={showUI}
        total_pages={total_pages}
      />

      {/* Reader Viewport */}
      <main
        className="h-screen overflow-y-auto bg-white/10"
        style={{ transform: `scale(${zoom})` }}
      >
        <div className=" flex flex-col gap-5 items-center justify-center h-full w-full">
          <span>READER-SPACE</span>

          <span className="max-w-100 italic text-center">
            Hover/Click interactions are yet to be configured , use button below
            to check tht UI hide/show
          </span>

          <Button onClick={() => setShowUI(!showUI)}>
            {showUI ? "Hide UI" : "Show UI"}
          </Button>
        </div>
      </main>

      {/* Bottom Control Bar */}
      <ReadBottomControls
        mode={mode}
        onModeToggle={() =>
          setMode((m) => (m === "scroll" ? "slide" : "scroll"))
        }
        zoom={zoom}
        setZoom={setZoom}
        visible={showUI}
      />
    </div>
  );
}
