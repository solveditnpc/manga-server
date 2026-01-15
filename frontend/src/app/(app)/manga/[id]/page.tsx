import Image from "next/image";
import { CopyToClipboardButton, Button } from "@/components/ui/";
import MangaTagsSection from "@/components/domain/manga/MangaTags";
import LikeButton from "@/components/domain/manga/LikeButton";
import PagesPreviewSection from "@/components/sections/PagesPreviewSection";
import CommentsSection from "@/components/sections/CommentsSection";
import mangas from "@/_mock/mangas.json";
import { Manga } from "@/types/manga.type";
import ENV_CONFIG from "@/config/env.config";
import Link from "next/link";
import mockComments from "@/_mock/mockComments.json";
import { Comment } from "@/types/comment.type";

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
    language = "N/A",
  } = mangas.mangas.find((m: Manga) => m.manga_id == paramID) || {};

  const rootComments: Comment[] = mockComments.comments.filter(
    (c) => c.parent_id === null
  );

  const InfoSection = () => (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold fg-primary">{title}</h1>

      <p className="fg-secondary">{author || "Unknown Author"}</p>

      <div className="flex items-center gap-4 text-sm fg-muted flex-wrap">
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
  );

  // Temoporary pages filler
  const page_files: any[] = Array.from({ length: total_pages }, (_, i) => null);

  return (
    <div className="w-screen max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="grid md:grid-rows-[350px_1fr] lg:grid-cols-[240px_1fr] lg:grid-rows-1 gap-6">
        {/* Left Column */}
        <div className="flex lg:flex-col gap-6">
          {/*Cover */}
          <div className="relative min-w-40 aspect-2/3 bg-card border border-default rounded-lg overflow-hidden">
            {cover_url ? (
              <Image
                src={cover_url}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full">
                <p className="fg-muted">Not Found</p>
              </div>
            )}
          </div>

          {/* Info, for small screens */}
          <div className="space-y-4">
            <div className="lg:hidden">
              <InfoSection />
            </div>
            <MangaTagsSection tags={tags} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Info , for wide screens */}
          <div className="hidden lg:block">
            <InfoSection />
          </div>
          {/* Preview Pages */}
          <div className="w-full">
            <p className="text-xs fg-muted mb-2">Pages :</p>

            <PagesPreviewSection page_files={page_files} manga_id={manga_id} />
          </div>
        </div>
      </div>
      <CommentsSection rootComments={rootComments} manga_id={manga_id} />
    </div>
  );
}
