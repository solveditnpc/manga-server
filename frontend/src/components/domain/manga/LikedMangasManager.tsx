"use client";
import { useState, useEffect } from "react";
import MangasGridSection from "@/components/sections/MangasGridSection";
import { Manga } from "@/types/manga.type";
import { Loader } from "lucide-react";
import LikedMangaCard from "./LikedMangaCard";
import { DEFAULT_PAGE_SIZE } from "@/config/manga.config";
import { listLikedMangas, toogleLike } from "@/server/manga/manga.action";
import { toast } from "sonner";

export default function LikedMangasManager({
  pageMangas,
  page,
  totalPages,
}: {
  pageMangas: Manga[];
  page: number;
  totalPages: number;
}) {
  const [mangas, setMangas] = useState<Manga[]>(pageMangas);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFetch = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await listLikedMangas({
        page,
        server: "S",
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

  const onUnlike = async (id: Manga["manga_id"]) => {
    await toogleLike({ manga_id: id, liked: false, server: "S" });
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
