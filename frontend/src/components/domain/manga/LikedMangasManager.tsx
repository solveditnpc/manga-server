"use client";

import MangasGridSection from "@/components/sections/MangasGridSection";
import { MangaList, Manga } from "@/types/manga.type";
import { useState, useEffect } from "react";
import { listLikedMangas, unlikeManga , DEFAULT_PAGE_SIZE } from "@/client/mangas.client";
import { Loader } from "lucide-react";
import LikedMangaCard from "./LikedMangaCard";

export default function LikedMangasManager({
  pageMangas,
  page,
  totalPages,
}: {
  pageMangas: MangaList;
  page: number;
  totalPages: number;
}) {
  const [mangas, setMangas] = useState<MangaList>(pageMangas);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFetch = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const updatedBatch = await listLikedMangas({
        page,
      });
      setMangas(updatedBatch);
    } finally {
      setLoading(false);
    }
  };

  const onUnlike = async (id: Manga["manga_id"]) => {
    await unlikeManga(id);
    setMangas((prev) => prev.filter((m) => m.manga_id !== id));
  };

  useEffect(() => {
    if (loading || page >= totalPages) return;

    // immediate fetch call after half of the page is empty during deletes
    if (mangas.length < DEFAULT_PAGE_SIZE / 2) {
      handleFetch();
      return;
    }

    // debounced fetch call after some removal occured and page is slightlty empty
    if (mangas.length < DEFAULT_PAGE_SIZE) {
      const debounce = setTimeout(() => {
        handleFetch();
      }, 1500);
      return () => clearTimeout(debounce);
    }
  }, [mangas.length, loading, page]);

  useEffect(() => {
    setMangas(pageMangas);
  }, [pageMangas]);

  return (
    <div>
      <MangasGridSection>
        {mangas.map((manga) => {
          return (
            <LikedMangaCard
              key={manga.manga_id}
              manga={manga}
              onUnlike={onUnlike}
            />
          );
        })}
      </MangasGridSection>

      {loading && (
        <div className="flex justify-center">
          <Loader className="animate-spin" />
        </div>
      )}
    </div>
  );
}
