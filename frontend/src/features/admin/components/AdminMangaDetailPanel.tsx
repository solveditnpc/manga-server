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
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <aside
        className="
          fixed
          top-0
          right-0
          h-screen
          w-70
          bg-card
          border-l border-default
          z-50
          p-4
          overflow-y-auto
        "
      >
        <div className="flex justify-between items-start">
          <h2 className="text-sm font-semibold fg-primary">Manga Details</h2>
          <button
            onClick={onClose}
            className="text-xs fg-muted hover:fg-primary"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          <div className="relative w-40 aspect-2/3 bg-card border border-default rounded-lg overflow-hidden">
            {manga.cover_url ? (
              <img
                src={manga.cover_url}
                alt={manga.title}
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full">
                <p className="fg-muted">Not Found</p>
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

          <div>
            <div className="fg-muted mb-1">Tags :</div>
            <div className="ml-4 mt-2">
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
    <div className="flex gap-2 items-center flex-wrap">
      <div className="fg-muted">{label} : </div>
      <div className={mono ? "font-mono" : ""}>{value}</div>
    </div>
  );
}
