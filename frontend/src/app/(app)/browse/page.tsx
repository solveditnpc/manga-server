"use client";

import MangaCard from "@/components/domain/manga/MangaCard";
import HorizontalScroller from "@/components/sections/HorizontalScroller";
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
      <HorizontalScroller />

      {/* Separator */}
      <div className=" w-full border-t-2 border-default" />

      {/* All Manga */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold fg-primary">All Manga</h2>

        <div
          className="
            grid
            gap-4
            grid-cols-[repeat(auto-fill,minmax(140px,1fr))]
            sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]
            md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]
            lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]
          "
        >
          {allMangas.map((manga: Manga, i) => (
            <MangaCard key={i /*manga.manga_id*/} {...manga} />
          ))}
        </div>
      </section>

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
