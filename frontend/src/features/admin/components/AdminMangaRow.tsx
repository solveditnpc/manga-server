"use client";

import { Manga } from "@/types/manga.type";
import { Button } from "@/components/ui/";

type Props = {
  manga: Manga;
  onDelete: (id: number, manga_title: string) => void;
  deleting?: boolean;
  onSelect: (manga: Manga) => void;
  selected: boolean;
};

export default function AdminMangaRow({
  manga,
  onDelete,
  deleting,
  onSelect,
  selected,
}: Props) {
  return (
    <tr
      onClick={() => onSelect(manga)}
      className={`
        cursor-pointer
        border-l
        ${selected ? "bg-background border-accent" : "border-transparent"}
      `}
    >
      {/* ID */}
      <td className="py-2 pr-3 text-xs fg-muted font-mono">
        #{manga.manga_id}
      </td>

      {/* Cover */}
      <td className="py-2 pr-3">
        <div className="w-10 h-14 bg-background border border-default rounded overflow-hidden">
          {manga.cover_url && (
            <img
              src={manga.cover_url}
              alt={manga.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </td>

      {/* Title */}
      <td className="py-2 pr-3 fg-primary truncate max-w-65">
        {manga.title}
      </td>

      {/* Author — desktop only */}
      <td className="py-2 pr-3 fg-muted truncate hidden lg:table-cell">
        {manga.author || "—"}
      </td>

      {/* Language — desktop only */}
      <td className="py-2 pr-3 fg-muted hidden lg:table-cell">
        {manga.language || "—"}
      </td>

      {/* Likes — desktop only */}
      <td className="py-2 pr-3 text-right fg-muted hidden lg:table-cell">
        {manga.likes_count ?? "—"}
      </td>

      {/* Date — desktop only (placeholder for now) */}
      <td className="py-2 pr-3 fg-muted text-xs hidden lg:table-cell">—</td>

      {/* Action */}
      <td className="py-2 text-right">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(manga.manga_id, manga.title);
          }}
          variant="danger"
          disabled={deleting}
          className="w-20"
        >
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </td>
    </tr>
  );
}
