"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import MangaCard from "@/components/domain/manga/MangaCard";
import mockMangas from "@/_mock/mangas.json";
import { MangaList, Manga } from "@/types/manga.type";

export default function HorizontalScroller() {
  const mangas: MangaList = mockMangas.mangas;

  if (!mangas || mangas.length === 0) return null;

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    containerRef.current?.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    containerRef.current?.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        {/* Header */}
        <h2 className="text-lg font-semibold fg-primary">Continue Reading</h2>

        <div className="flex items-center gap-2">
          <Button
            onClick={scrollLeft}
            className="fg-muted"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </Button>

          <Button
            onClick={scrollRight}
            className="fg-muted"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Horizontal list */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
      >
        {mangas.map((manga: Manga) => (
          <MangaCard key={manga.manga_id} {...manga} />
        ))}
      </div>
    </section>
  );
}
