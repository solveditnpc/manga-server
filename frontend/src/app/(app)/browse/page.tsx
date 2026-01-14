"use client";

import MangaCard from "@/components/domain/manga/MangaCard";
import HorizontalScroller from "@/components/sections/HorizontalScroller";
import MangasGridSection from "@/components/sections/MangasGridSection";
import { Pagination } from "@/components/ui";
import mockMangas from "@/_mock/mangas.json";
import { useState } from "react";
import { MangaList, Manga } from "@/types/manga.type";

export default function DashboardPage() {
  const allMangas: MangaList = [...mockMangas.mangas, ...mockMangas.mangas];
  const [page, setPage] = useState(1);
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Continue Reading */}
      <HorizontalScroller
        title="Continue Reading"
        href="/"
        mangas={allMangas}
      />

      {/* Separator */}
      <div className=" w-full border-t-2 border-default" />

      <MangasGridSection
        title="All Mangas"
        mangas={mockMangas.mangas}
        href="/"
      />

      {/* Pagination Controls*/}
      <div
        className="
          flex justify-center
          w-full overflow-hidden
          h-7
          lg:h-full
          "
      >
        <Pagination
          currentPage={page}
          totalPages={50}
          onPageChange={(page) => setPage(page)}
        />
      </div>
    </main>
  );
}
