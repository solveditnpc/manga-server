import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Manga } from "@/types/manga.type";

export default function MangaCard({
  manga_id,
  title,
  author,
  cover_url,
  language,
  likes_count,
}: Manga) {
  const href = `/manga/${manga_id}`;
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
        min-w-35
        sm:min-w-40
        md:min-w-45
        lg:min-w-50
        relative
        cursor-pointer
        "
    >
      {/* likes_count (read-only) */}
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
      >
        {Number(likes_count || 0) || 0}
        <Heart size={10} className="mt-0.5 fill-primary" />
      </div>

      {/* Cover */}
      <div className="relative overflow-hidden w-full aspect-2/3 bg-background">
        <Image src={cover_url} alt={title} fill className="object-cover" />
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
