import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

interface MangaCardProps {
  id: string | number;
  title: string;
  author?: string;
  coverUrl: string;
  language: string;
  likes?: number;
  href: string; // usually /manga/[id]
}

export default function MangaCard({
  title,
  author,
  coverUrl,
  language,
  likes,
  href,
}: MangaCardProps) {
  return (
    <Link
      href={href}
      className="
        bg-card
        border border-default
        rounded-lg
        overflow-hidden
        hover-card
        focus-ring
        block
        w-60
        relative
      "
    >
      {/* Likes (read-only) */}
      {typeof likes === "number" && (
        <div
          className="
            absolute
            top-1.5
            right-1.5
            z-10
            bg-black/70
            backdrop-blur
            rounded-md
            px-1.5
            py-1
            text-[11px]
            pointer-events-none
            flex
            gap-0.5

          "
          aria-label={`${likes} likes`}
        >
          {likes}
          <Heart size={10} className="mt-0.5 fill-(--text-primary)" />
        </div>
      )}

      {/* Cover */}
      <div className="relative overflow-hidden w-full aspect-2/3 bg-background">
        <Image src={coverUrl} alt={title} fill className="object-cover" />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm fg-primary truncate" title={title}>
          {title}
        </h3>

        {author && <p className="text-sm fg-secondary truncate">{author}</p>}

        {language && (
          <p className="text-xs fg-muted truncate italic">{language}</p>
        )}
      </div>
    </Link>
  );
}
