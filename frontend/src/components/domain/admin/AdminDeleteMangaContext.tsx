"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { Manga } from "@/types/manga.type";
import { toast } from "sonner";
import { delay } from "@/_mock/mockPromise";

interface AdminMangaDeleteContextValue {
  deleteManga: (manga_id: Manga["manga_id"]) => void;
  deletingIds: Set<Manga["manga_id"]>;
}

const AdminMagnaDeleteContext =
  createContext<AdminMangaDeleteContextValue | null>(null);

export const AdminMagnaDeleteContextProvider = ({
  children,
  onDeleteComplete,
  setIsIdle,
}: {
  children: React.ReactNode;
  onDeleteComplete?: (manga_id: Manga["manga_id"]) => void;
  setIsIdle?: (isIdle: boolean) => void;
}) => {
  const [deletingIds, setDeletingIds] = useState<Set<Manga["manga_id"]>>(
    new Set(),
  );

  const deleteManga = async (manga_id: Manga["manga_id"]) => {
    try {
      setDeletingIds((prev) => {
        let newSet = new Set(prev);
        newSet.add(manga_id);
        return newSet;
      });
      await delay(2000);
      onDeleteComplete?.(manga_id);
    } catch (error) {
      toast.error(`Failed to delete manga ${manga_id}`);
    } finally {
      setDeletingIds((prev) => {
        let newSet = new Set(prev);
        newSet.delete(manga_id);
        return newSet;
      });
    }
  };

  useEffect(() => setIsIdle?.(deletingIds.size === 0), [deletingIds]);

  return (
    <AdminMagnaDeleteContext.Provider value={{ deleteManga, deletingIds }}>
      {children}
    </AdminMagnaDeleteContext.Provider>
  );
};

export function useAdminMangaDelete() {
  const ctx = useContext(AdminMagnaDeleteContext);

  if (!ctx) {
    throw new Error(
      "useAdminMangaDelete must be used within AdminMangaDeleteProvider",
    );
  }

  return ctx;
}
