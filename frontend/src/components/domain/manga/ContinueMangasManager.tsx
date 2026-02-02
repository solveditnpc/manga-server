"use client";
import { useState, useEffect } from "react";

import MangasGridSection from "@/components/sections/MangasGridSection";
import ContinueMangaCard from "@/components/domain/manga/ContinueMangaCard";
import { toast } from "sonner";

import {
  listContinueMangas,
  removeContinueManga,
} from "@/server/manga/manga.action";
import { DEFAULT_PAGE_SIZE } from "@/config/manga.config";
import { ContinueManga, Manga } from "@/types/manga.type";
import { Loader } from "lucide-react";

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
      const res = await listContinueMangas({
        page,
      });
      if (!res.ok) {
        toast.error("Failed to fetch mangas", {
          description: res.error,
        });
        return;
      }
      const updatedBatch = res.value.mangas;
      setMangas(updatedBatch);
    } catch (error) {
      toast.error("Failed to fetch mangas", {
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRemove = async (id: Manga["manga_id"]) => {
    try {
      const res = await removeContinueManga({ manga_id: id, server: "S" });
      if (!res.ok) {
        toast.error("Failed to remove manga", {
          description: res.error,
        });
        return;
      }
      setMangas((prev) => prev.filter((m) => m.manga_id !== id));
    } catch (error) {
      toast.error("Failed to remove manga", {
        description: (error as Error).message,
      });
    }
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
