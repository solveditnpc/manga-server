import Link from "next/link";
import { Heart } from "lucide-react";
import { Manga } from "@/types/manga.type";
import SafeImage from "@/components/ui/SafeImage";

interface MangaCardProps {
  manga: Manga;
  href?: string;
}

export default function MangaCard({ manga, href }: MangaCardProps) {
  const { manga_id, title, author, cover_url, language, likes_count } = manga;
  if (!href) href = `/manga/${manga_id}`;
  
  return (
    <Link
      href={href}
      aria-label={`Open manga ${title}`}
      className="
        bg-card hover-card
        border border-default
        rounded-lg focus-ring
        overflow-hidden
        relative block
        cursor-pointer
        min-w-35
        sm:min-w-40
        md:min-w-45
        lg:min-w-50
        "
    >
      {/* likes_count (read-only) */}
      <div
        className="
            absolute z-10
            top-1.5 right-1.5
            bg-background/70
            backdrop-blur
            rounded-md
            px-1.5 py-1
            pointer-events-none
            flex gap-0.5 items-center
          "
      >
        <span className="text-xs fg-primary"> {Number(likes_count || 0)}</span>
        <Heart size={11} className="fill-primary" />
      </div>

      {/* Cover */}
      <div className="relative overflow-hidden w-full aspect-2/3 bg-background">
        <SafeImage
          src={cover_url}
          alt={title}
          fill
          sizes="(min-width: 1024px) 200px, (min-width: 768px) 180px, 160px"
          className="object-cover"
          quality={40}
          fallbackMsg="Unable to get cover"
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm fg-primary truncate" title={title}>
          {title}
        </h3>

        {author && <p className="text-xs fg-secondary truncate">{author}</p>}

        {language && (
          <p className="text-xs fg-muted truncate italic">{language}</p>
        )}
      </div>
    </Link>
  );
}
