import Image from "next/image";
import { Badge, CopyToClipboardButton, Button } from "@/components/ui/";
import { LikeButton, PagesPreviewGrid } from "@/features/manga/components";
import mangas from "@/mockData/mangas.json";
import { Manga } from "@/types/manga.type";
import ENV_CONFIG from "@/config/env.config";
import Link from "next/link";

export default async function MangaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paramID: number = Number(id || 0) || 0;

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
    <div className="w-screen max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="grid md:grid-cols-[240px_1fr] grid-rows-1 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/*Cover */}
          <div className="relative aspect-2/3 bg-card border border-default rounded-lg overflow-hidden">
            {cover_url ? (
              <Image
                src={cover_url}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="fg-muted">Not Found</p>
              </div>
            )}
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
                copyText={`${ENV_CONFIG.client_url}/manga/${manga_id}`}
                successMessage="Link to the manga Copied!"
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <LikeButton mangaId={manga_id} initialCount={likes_count} />

              <Link href={`/read/${manga_id}?page=1`}>
                <Button>Read</Button>
              </Link>
            </div>
          </div>

          {/* Preview Pages */}
          <div className="w-full">
            <p className="text-xs fg-muted mb-2">Pages :</p>

            <PagesPreviewGrid page_files={page_files} manga_id={manga_id} />
          </div>
        </div>
      </div>
    </div>
  );
}
