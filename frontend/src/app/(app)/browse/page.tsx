"use client";
import {
  MangaCard,
  PaginationControls,
  ContinueReadingSection,
} from "@/components/dashboard";
import mockMangas from "../../../mockData/mangas.json";
import { useState } from "react";

export default function DashboardPage() {
  const allMangas = [...mockMangas.mangas, ...mockMangas.mangas];
  const [page, setPage] = useState(1);
  return (
    <main className="max-w-screen mx-auto px-4 py-8 space-y-8">
      {/* Continue Reading */}
      <ContinueReadingSection />

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
            xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]
            2xl:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]
          "
        >
          {allMangas.map((manga, i) => (
            <MangaCard key={i} {...manga} href={"#" /*`/manga/${manga.id}`*/} />
          ))}
        </div>
      </section>

      {/* Pagination Controls*/}
      <div className="flex justify-center">
        <PaginationControls
          currentPage={page}
          totalPages={50}
          onPageChange={(page) => {
            setPage(page);
          }}
        />
      </div>
    </main>
  );
}
