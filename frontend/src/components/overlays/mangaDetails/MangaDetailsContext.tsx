"use client";
import { createContext, useContext, useState } from "react";
import { Manga } from "@/types/manga.type";
import MangaDetailsOverlay from "./MangaDetailsOverlay";

type MangaDetailsContextValue = {
  manga: Manga | null;
  open: boolean;
  openManga: (manga: Manga) => void;
  closeManga: () => void;
};

export const MangaDetailsContext = createContext<MangaDetailsContextValue | null>(
  null
);

export function MangaDetailsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [manga, setManga] = useState<Manga | null>(null);
  const open = manga !== null;

  const openManga = (manga: Manga) => setManga(manga);

  const closeManga = () => setManga(null);

  return (
    <MangaDetailsContext.Provider value={{ manga, open, openManga, closeManga }}>
      {children}
      <MangaDetailsOverlay />
    </MangaDetailsContext.Provider>
  );
}

export function useMangaDetails() {
  const ctx = useContext(MangaDetailsContext);

  if (!ctx) {
    throw new Error("useMangaDetail must be used within MangaDetailProvider");
  }

  return ctx;
}
