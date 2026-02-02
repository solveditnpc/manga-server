import { CopyToClipboardButton, SafeImage, LinkButton } from "@/components/ui/";
import MangaTagsSection from "@/components/domain/manga/MangaTags";
import LikeButton from "@/components/domain/manga/LikeButton";
import PagesPreviewSection from "@/components/sections/PagesPreviewSection";
import CommentsSection from "@/components/sections/CommentsSection";
import ChaptersTable from "@/components/domain/manga/ChaptersTable";
import ToastForServer from "@/components/domain/server/ToastForServer";

import ENV_CONFIG from "@/config/env.config";
import { MangaFallback } from "@/config/manga.config";

import { getMangaDetails } from "@/server/manga/manga.action";
import { listRootComments } from "@/server/comment/comment.actions";

export default async function MangaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paramID: number = Number(id || 0) || 0;
  const INTIAL_LIKED = true; // Whether the manga is liked by user

  const [mangaRes, commentsRes] = await Promise.all([
    getMangaDetails({ id: paramID, server: "S" }),
    listRootComments({ manga_id: paramID }),
  ]);

  if (!mangaRes.ok)
    return (
      <ToastForServer
        type={"error"}
        title="Error Ferching Manga"
        description={mangaRes.error}
      />
    );

  const rootComments = commentsRes.ok ? commentsRes.value : [];

  const {
    manga_id = paramID,
    title = "Manga Not Found (404)",
    author = "Unknown Author",
    cover_image = "",
    tags = [],
    total_pages = 0,
    like_count = 0,
    language = "N/A",
    page_files = [],
    chapters = [],
  } = mangaRes.value || MangaFallback;

  const InfoSection = (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold fg-primary">{title}</h1>

      <p className="fg-secondary">{author || "Unknown Author"}</p>

      <div className="flex items-center gap-4 text-sm fg-muted flex-wrap">
        <span>{language}</span>
        <span>•</span>
        <span>
          {chapters.length > 0
            ? `${chapters.length} Chapters`
            : `${total_pages} Pages`}
        </span>
        <span>•</span>
        <CopyToClipboardButton
          displayText={`#${manga_id}`}
          copyText={`${ENV_CONFIG.client_url}/manga/${manga_id}`}
          successMessage="Link to the manga Copied!"
        />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <LikeButton
          mangaId={manga_id}
          initialCount={like_count}
          initialLiked={INTIAL_LIKED}
        />

        <LinkButton href={`/read/${manga_id}?page=1`}>Read </LinkButton>
      </div>
    </div>
  );

  return (
    <div className="w-screen max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="grid md:grid-rows-[350px_1fr] lg:grid-cols-[240px_1fr] lg:grid-rows-1 gap-6">
        {/* Desktop: Left Column ,Mobile: Top Section*/}
        <div className="flex lg:flex-col gap-6">
          {/*Cover */}
          <div className="relative min-w-40 aspect-2/3 bg-card border border-default rounded-lg overflow-hidden">
            {cover_image ? (
              <SafeImage
                src={cover_image}
                alt={title}
                fill
                className="object-cover"
                quality={40}
              />
            ) : (
              <div className="flex items-center justify-center w-full">
                <p className="fg-muted">Not Found</p>
              </div>
            )}
          </div>

          {/* Info, for Mobile */}
          <div className="space-y-4">
            <div className="lg:hidden">{InfoSection}</div>
            <MangaTagsSection tags={tags} />
          </div>
        </div>
        {/* Desktop: Right Column ,Mobile: Bottom Section*/}
        <div className="space-y-6">
          {/* Info , for Desktop */}
          <div className="hidden lg:block">{InfoSection}</div>
          {/* Preview Pages */}
          <div className="w-full">
            <p className="text-xs fg-muted mb-2">
              {chapters.length > 0 ? "Chapters" : "Pages Preview"} :
            </p>

            {chapters.length > 0 ? (
              <ChaptersTable mangaId={manga_id} chapters={chapters} />
            ) : (
              <PagesPreviewSection
                manga_id={manga_id}
                total_pages={total_pages}
                pages={page_files}
              />
            )}
          </div>
        </div>
      </div>
      {manga_id > -1 && (
        <CommentsSection rootComments={rootComments} manga_id={paramID} />
      )}
    </div>
  );
}
