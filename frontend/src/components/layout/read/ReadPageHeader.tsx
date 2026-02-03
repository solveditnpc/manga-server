import { X } from "lucide-react";
import { Manga } from "@/types/manga.type";
import { LinkButton } from "@/components/ui";
import { useServerContext } from "@/components/domain/server/ServerContext";

interface ReadPageHeaderProps extends Pick<
  Manga,
  "manga_id" | "title" | "author"
> {
  chatperTitle?: string;
  visible?: boolean;
}

export default function ReadPageHeader({
  manga_id,
  title,
  author,
  chatperTitle,
  visible = true,
}: ReadPageHeaderProps) {
  const { routePrefix } = useServerContext();
  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-20
        h-15
        px-3 sm:px-4
        flex items-center
        bg-background/80
        border-b border-default
        text-xs
        transition-opacity duration-slow
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      {/* Left: Close */}
      <LinkButton
        href={`${routePrefix}/manga/${manga_id}`}
        className="px-1.5! hover:bg-background/60"
        title="Close reader"
        variant="ghost"
      >
        <X size={16} />
      </LinkButton>

      {/* Center: Title */}
      <div className="flex-1 mx-3 overflow-hidden">
        <h1 className="fg-primary text-sm sm:text-base truncate">
          {title} / <span className="fg-secondary">{chatperTitle}</span>
        </h1>
        {author && <span className="fg-muted text-xs truncate">{author}</span>}
      </div>
    </header>
  );
}
