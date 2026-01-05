"use client";

import { Manga } from "@/types/manga.type";
import { Button } from "@/components/ui/";

type Props = {
  manga: Manga;
  onDelete: (id: number, manga_title: string) => void;
  deleting?: boolean;
};

export default function AdminMangaRow({ manga, onDelete, deleting }: Props) {
  return (
    <>
      <tr
        className={`border-b border-default last:border-b-0 ${
          deleting ? "opacity-60" : ""
        }`}
      >
        <td className="py-2 pr-3 text-xs fg-muted font-mono">
          #{manga.manga_id}
        </td>

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

        <td className="py-2 pr-3 fg-primary truncate">{manga.title}</td>

        <td className="py-2 pr-3 fg-muted truncate">{manga.author || "—"}</td>
        <td className="py-2 pr-3 fg-muted truncate">{manga.language || "—"}</td>

        <td className="py-2 pr-3 text-right fg-muted">
          {manga.likes_count ?? "—"}
        </td>

        <td className="py-2 pr-3 fg-muted text-xs">—</td>

        <td className="py-2 text-right">
          <Button
            onClick={() => onDelete(manga.manga_id, manga.title)}
            variant="danger"
            disabled={deleting}
            className="w-20"
          >
            {deleting ? "Deleting…" : "Delete"}{" "}
          </Button>
        </td>
      </tr>
    </>
  );
}
