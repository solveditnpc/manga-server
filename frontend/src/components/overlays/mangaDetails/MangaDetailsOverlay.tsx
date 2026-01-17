"use client";
import { useEffect } from "react";
import MangaTagsSection from "../../domain/manga/MangaTags";
import { CopyToClipboardButton, SafeImage } from "@/components/ui";
import { X } from "lucide-react";
import { useMangaDetails } from "./MangaDetailsContext";

export default function MangaDetailsOverlay({}) {
  const { manga, open, closeManga } = useMangaDetails();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeManga();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeManga, open]);

  if (!open || !manga) return null;

  const {
    manga_id,
    title,
    author,
    language,
    cover_url,
    tags,
    likes_count,
    total_pages,
  } = manga;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
        onClick={() => closeManga()}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="manga-detail-title"
        tabIndex={0}
        className="
          fixed z-50
          inset-0 sm:inset-y-0
          sm:right-[1vh] sm:left-auto
          h-[98vh] mt-[1vh]
          w-full sm:w-90
          bg-card
          border border-default
          p-4
          overflow-y-auto
          focus-ring
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold fg-primary">Manga Details</h2>
          <button
            onClick={() => closeManga()}
            className="text-sm fg-muted hover:fg-primary cursor-pointer rounded-2xl focus-ring"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          {/* Cover */}
          <div className="relative w-45 aspect-2/3 bg-card border border-default rounded-lg overflow-hidden">
            {cover_url ? (
              <SafeImage
                src={cover_url}
                alt={title || "Manga cover"}
                className="object-cover"
                fallbackMsg="Unable to load cover"
                fill
                quality={40}
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
                displayText={`#${manga_id}`}
                copyText={`${manga_id}`}
              />
            }
          />
          <Detail label="Title" value={title} />
          <Detail label="Author" value={author || "—"} />
          <Detail label="Language" value={language || "—"} />
          <Detail label="Pages" value={total_pages} />
          <Detail label="Likes" value={likes_count ?? 0} />

          {/* Tags */}
          <div>
            <div className="fg-muted mb-1 text-xs">Tags : </div>
            <div className="ml-10 mt-2">
              <MangaTagsSection tags={tags || []} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(80px,auto)_1fr] gap-2 items-center">
      <div className="fg-muted text-xs">{label} :</div>
      <div>{value}</div>
    </div>
  );
}
