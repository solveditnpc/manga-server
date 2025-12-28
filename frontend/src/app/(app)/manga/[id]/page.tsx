"use client";

import Image from "next/image";
import { Badge, CopyToClipboardButton } from "@/components/ui/";
import { LikeButton } from "@/features/details/components";
import mangas from "@/mockData/mangas.json";
import { useParams } from "next/navigation";
import { Manga } from "@/types/manga.type";

export default function MangaDetailsPage() {
  const params = useParams();
  const paramID :number = Number(params.id || 0) || 0;

  const {
    manga_id = paramID,
    title = "Manga Not Found (404)",
    author = "Unknown Author",
    cover_url = "",
    tags = [],
    total_pages = 0,
    likes_count = 0,
  } = mangas.mangas.find((m: Manga) => m.manga_id == paramID) || {};

  // Temoporary pages filler
  const page_files: any[] = Array.from({ length: total_pages }, (_, i) => null);

  const parsedTags: Record<string, string[]> = {};
  let language = "N/A";

  tags.forEach((tag) => {
    const type = tag.type?.toLowerCase();
    if (!type) return;

    if (!parsedTags[type]) parsedTags[type] = [];
    parsedTags[type].push(tag.name);

    if (type === "languages" && tag.name !== "translated") {
      language = tag.name.toUpperCase();
    }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="grid md:grid-cols-[240px_1fr] grid-rows-1 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/*Cover */}
          <div className="relative aspect-2/3 bg-card border border-default rounded-lg overflow-hidden">
            <Image src={cover_url} alt={title} fill className="object-cover" />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            {Object.entries(parsedTags).map(([type, values]) => (
              <div key={type} className="flex gap-3">
                <p className="text-xs fg-muted capitalize text-nowrap">
                  {type} :
                </p>

                <div className="flex flex-wrap gap-2">
                  {values.map((v) => (
                    <Badge key={v}>{v}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Info */}
          <div className="space-y-3">
            <h1 className="text-xl font-semibold fg-primary">{title}</h1>

            <p className="fg-secondary">{author || "Unknown Author"}</p>

            <div className="flex items-center gap-4 text-sm fg-muted">
              <span>{language}</span>
              <span>•</span>
              <span>{total_pages} pages</span>
              <span>•</span>
              <CopyToClipboardButton
                displayText={`#${manga_id}`}
                copyText={`${window.location.origin}/manga/${manga_id}`}
                successMessage="Link to the manga Copied!"
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <LikeButton mangaId={manga_id} initialCount={likes_count} />

              <a
                href={`/read/${manga_id}`}
                className="
                  bg-card
                  border border-default
                  rounded-md
                  px-4 py-2
                  text-sm
                  fg-primary
                  hover-card
                  focus-ring
                "
              >
                Read
              </a>
            </div>
          </div>

          {/* Preview Pages */}
          <div>
            <p className="text-xs fg-muted mb-2">Pages :</p>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
              {page_files.map((page, i) => (
                <div
                  key={i}
                  className="
                          relative
                          aspect-2/3
                          bg-card
                          border border-default
                          rounded
                          overflow-hidden
                          max-h-50
                        "
                >
                  <div className="w-full h-full flex items-center justify-center text-xs fg-muted">
                    Page {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
