"use client";

import MangasGridSection from "@/components/sections/MangasGridSection";
import { ContinueManga, Manga } from "@/types/manga.type";
import { useState, useEffect } from "react";
import {
  listContinueMangas,
  removeContinueManga,
  DEFAULT_PAGE_SIZE,
} from "@/client/mangas.client";
import { Loader } from "lucide-react";
import ContinueMangaCard from "./ContinueMangaCard";

export default function ContinueMangasManager({
  pageMangas,
  page,
  totalPages,
}: {
  pageMangas: ContinueManga[];
  page: number;
  totalPages: number;
}) {
  const [mangas, setMangas] = useState<ContinueManga[]>(pageMangas);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFetch = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const updatedBatch = await listContinueMangas({
        page,
      });
      setMangas(updatedBatch);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onRemove = async (id: Manga["manga_id"]) => {
    await removeContinueManga(id);
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
            <ContinueMangaCard
              key={manga.manga_id}
              manga={manga}
              onRemove={onRemove}
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
