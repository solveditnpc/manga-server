import Link from "next/link";
import { Chapter } from "@/types/manga.type";

interface Props {
  mangaId: number;
  chapters: Chapter[];
}

export default function ChaptersList({ mangaId, chapters }: Props) {
  if (!chapters.length) return null;

  return (
    <div className="max-w-3xl space-y-2">
      {chapters.map((chapter, index) => (
        <Link
          key={index}
          href={`/read/${mangaId}?chapter=${chapter.title}&page=1`}
          className="
            flex items-center justify-between
            gap-4
            px-4 py-3
            rounded-lg
            bg-card
            border border-default
            hover-card
            focus-ring
          "
        >
          <span className="truncate fg-primary">
            {chapter.title || `Chapter ${index + 1}`}
          </span>

          <span className="text-xs fg-muted whitespace-nowrap">
            {chapter.images.length} pages
          </span>
        </Link>
      ))}
    </div>
  );
}
