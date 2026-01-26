"use client";
import MangaCard from "@/components/domain/manga/MangaCard";
import { Button } from "@/components/ui";
import { X } from "lucide-react";
import { ContinueManga } from "@/types/manga.type";
import ENV_CONFIG from "@/config/env.config";

interface ContinueMangaCardProps {
  manga: ContinueManga;
  disableActions?: boolean;
  onRemove?: (mangaId: ContinueManga["manga_id"]) => void;
}

export default function ContinueMangaCard({
  manga,
  disableActions = false,
  onRemove,
}: ContinueMangaCardProps) {
  const hrefUrl = new URL(manga.href, ENV_CONFIG.client_url);
  const currentPage = Number(hrefUrl.searchParams.get("page"));
  const totalPages = manga.total_pages;

  let progressPercent = 0;

  if (
    Number.isFinite(currentPage) &&
    Number.isFinite(totalPages) &&
    totalPages > 0
  ) {
    progressPercent = Math.max((currentPage / totalPages) * 100, 1);
  }
  const handleRemove = () => {
    onRemove?.(manga.manga_id);
  };

  return (
    <div className="relative group">
      {/* Card */}
      <MangaCard manga={manga} href={manga.href} />

      {/* Progress bar */}
      <div
        className="h-1 absolute bottom-17 rounded-full bg-accent transition-all"
        style={{ width: `${progressPercent}%` }}
      />
      {!disableActions && (
        <Button
          onClick={handleRemove}
          className="absolute top-2 left-2 opacity-80 p-1.5!"
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
}
