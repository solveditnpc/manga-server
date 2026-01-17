"use client";

import { useState } from "react";
import AdminMangaRow from "./AdminMangaRow";
import { MangaList } from "@/types/manga.type";
import { ask } from "../../overlays/confirm/confirm";
import { useMangaDetails } from "@/components/overlays/mangaDetails/MangaDetailsContext";

export default function AdminMangaListPanel({
  mangas,
  onDelete,
}: {
  mangas: MangaList;
  onDelete: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);

  const { openManga: onSelectManga, manga: selectedManga } = useMangaDetails();

  async function handleDelete(manga_id: number, manga_title: string) {
    const res = await ask({
      title: "Delete Manga",
      description: `Are you sure you want to delete "${manga_title}"?`,
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (res) onDelete(manga_id);
  }

  if (mangas.length === 0)
    return <div className="fg-muted text-sm">No mangas found.</div>;

  const rowClassName = "text-xs fg-muted py-2 pr-2";
  return (
    <section>
      <h2 className="px-4 py-3 text-sm font-medium fg-primary border-b border-default">
        Existing Mangas
      </h2>
      <div className="bg-card">
        {/* ================== MOBILE LIST ================== */}
        <div className="block sm:hidden divide-y divide-default">
          {mangas.map((manga) => (
            <div
              key={manga.manga_id}
              onClick={() => onSelectManga(manga)}
              className={`p-4 flex gap-3 cursor-pointer ${
                selectedManga?.manga_id === manga.manga_id
                  ? "bg-background"
                  : ""
              }`}
            >
              {/* Cover */}
              <div className="w-12 h-16 bg-background border border-default rounded overflow-hidden shrink-0">
                {manga.cover_url && (
                  <img
                    src={manga.cover_url}
                    alt={manga.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="fg-primary text-sm truncate">{manga.title}</div>
                <div className="fg-muted text-xs truncate">
                  {manga.author || "—"}
                </div>
                <div className="fg-muted text-xs font-mono mt-1">
                  #{manga.manga_id}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(manga.manga_id, manga.title);
                  }}
                  className="text-xs fg-accent"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================== TABLE (TABLET + DESKTOP) ================== */}
        <div className="hidden sm:block px-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-default">
                <th className={`${rowClassName} text-left`}>ID</th>
                <th className={`${rowClassName} text-left`}>Cover</th>
                <th className={`${rowClassName} text-left`}>Title</th>
                <th
                  className={`${rowClassName} text-left hidden lg:table-cell`}
                >
                  Author
                </th>
                <th
                  className={`${rowClassName} text-left hidden lg:table-cell`}
                >
                  Language
                </th>
                <th
                  className={`${rowClassName} text-right hidden lg:table-cell`}
                >
                  Likes
                </th>
                <th
                  className={`${rowClassName} text-left hidden lg:table-cell`}
                >
                  Date
                </th>
                <th className={`${rowClassName} text-right`}>Action</th>
              </tr>
            </thead>

            <tbody>
              {mangas.map((manga) => (
                <AdminMangaRow
                  key={manga.manga_id}
                  manga={manga}
                  onDelete={handleDelete}
                  onSelect={onSelectManga}
                  selected={selectedManga?.manga_id === manga.manga_id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
