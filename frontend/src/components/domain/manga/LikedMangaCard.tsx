"use client";
import MangaCard from "@/components/domain/manga/MangaCard";
import { Manga } from "@/types/manga.type";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui";

interface LikedMangaCardProps {
  manga: Manga;
  disableActions?: boolean;
  onUnlike?: (mangaId: Manga["manga_id"]) => void;
}

export default function LikedMangaCard({
  manga,
  disableActions = false,
  onUnlike,
}: LikedMangaCardProps) {
  const handleUnlike = () => {
    onUnlike?.(manga.manga_id);
  };

  return (
    <div className="relative group">
      {/* Card */}
      <MangaCard manga={manga} />

      {!disableActions && (
        <Button
          onClick={handleUnlike}
          className="absolute top-2 left-2 opacity-80 p-1.5!"
        >
          <Heart size={16} className="fill-rose-500 stroke-rose-500" />
        </Button>
      )}
    </div>
  );
}
