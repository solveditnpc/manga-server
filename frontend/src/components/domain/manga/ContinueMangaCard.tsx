"use client";
import MangaCard from "@/components/domain/manga/MangaCard";
import { Button } from "@/components/ui";
import { useServerContext } from "@/components/domain/server/ServerContext";

import { toSearchParamsString } from "@/utils/params.utils";
import { ContinueManga } from "@/types/manga.type";
import { X } from "lucide-react";
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
  const { routePrefix } = useServerContext();
  const currentPage = Number(manga.progress?.page ?? 1);
  const chapter = manga.progress?.chapter ?? "";
  const href = `${routePrefix}read/${manga.manga_id}${chapter && `/${chapter}`}?${toSearchParamsString({ page :currentPage })}`;
  const totalPages = manga.progress?.currTotalPages ?? -1; // -1 means we not have correct data
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
      <MangaCard manga={manga} href={href} />

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
