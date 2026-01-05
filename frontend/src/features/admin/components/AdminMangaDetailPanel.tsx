"use client";

import { Manga } from "@/types/manga.type";
import { MangaTagsSection } from "@/features/manga/components";
import { useEffect } from "react";
import { CopyToClipboardButton } from "@/components/ui";

export default function AdminMangaDetailPanel({
  manga,
  onClose,
}: {
  manga: Manga;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className="
          fixed
          inset-0
          sm:inset-y-0 sm:right-0 sm:left-auto
          h-screen
          w-full sm:w-90
          bg-card
          border-l border-default
          z-50
          p-4
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold fg-primary">Manga Details</h2>
          <button
            onClick={onClose}
            className="text-sm fg-muted hover:fg-primary"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          {/* Cover */}
          <div className="relative w-45 aspect-2/3 bg-card border border-default rounded-lg overflow-hidden">
            {manga.cover_url ? (
              <img
                src={manga.cover_url}
                alt={manga.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <p className="fg-muted text-xs">Not Found</p>
              </div>
            )}
          </div>

          <Detail
            label="ID"
            value={
              <CopyToClipboardButton
                displayText={`#${manga.manga_id}`}
                copyText={`${manga.manga_id}`}
              />
            }
            mono
          />
          <Detail label="Title" value={manga.title} />
          <Detail label="Author" value={manga.author || "—"} />
          <Detail label="Language" value={manga.language || "—"} />
          <Detail label="Pages" value={manga.total_pages} />
          <Detail label="Likes" value={manga.likes_count ?? 0} />

                  
          {/* Tags */}
          <div>
            <div className="fg-muted mb-1 text-xs">Tags : </div>
            <div className="ml-10 mt-2">
              <MangaTagsSection tags={manga.tags || []} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[70px_1fr] gap-2 items-center">
      <div className="fg-muted text-xs">{label} :</div>
      <div className={mono ? "font-mono" : ""}>{value}</div>
    </div>
  );
}
