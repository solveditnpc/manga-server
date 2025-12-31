import { MangaTag } from "@/types/manga.type";
import { Badge } from "@/components/ui";

function MangaTagsSection({ tags }: { tags: MangaTag[] }) {
  const parsedTags: Record<string, string[]> = {};

  tags.forEach((tag) => {
    const type = tag.type?.toLowerCase();
    if (!type) return;

    if (!parsedTags[type]) parsedTags[type] = [];
    parsedTags[type].push(tag.name);
  });
  return (
    <div className="space-y-3">
      {Object.entries(parsedTags).map(([type, values]) => (
        <div key={type} className="flex gap-3">
          <p className="text-xs fg-muted capitalize text-nowrap">{type} :</p>

          <div className="flex flex-wrap gap-2">
            {values.map((v) => (
              <Badge key={v}>{v}</Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MangaTagsSection;