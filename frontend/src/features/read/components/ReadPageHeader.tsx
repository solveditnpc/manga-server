"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Manga } from "@/types/manga.type";

type MangaHeaderMeta = Pick<Manga, "manga_id" | "title" | "author">;
interface ReadPageHeaderProps extends MangaHeaderMeta {
  visible?: boolean;
}

export default function ReadPageHeader({
  manga_id,
  title,
  author,
  visible = true,
}: ReadPageHeaderProps) {
  const router = useRouter();
  const onClose = () => router.push(`/manga/${manga_id}`);
  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-20
        h-15
        px-3 sm:px-4
        flex items-center
        bg-black/80
        border-b border-default
        text-xs
        transition-opacity duration-200
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      {/* Left: Close */}
      <button
        onClick={onClose}
        className="hover-card px-1 py-1 rounded fg-muted"
        title="Close reader"
      >
        <X size={16} />
      </button>

      {/* Center: Title */}
      <div className="flex-1 mx-3 overflow-hidden">
        <h1 className="fg-primary text-sm sm:text-base truncate">{title}</h1>
        {author && <span className="fg-muted text-xs truncate">{author}</span>}
      </div>
    </header>
  );
}
