import { MangaList, Manga } from "@/types/manga.type";
import MangaCard from "@/components/domain/manga/MangaCard";
import { LinkButton } from "@/components/ui";
import { ArrowRight } from "lucide-react";

interface MangasGridSectionProps {
  title: string;
  mangas: MangaList;
  href?: string;
}

export default function MangasGridSection({ mangas, title, href }: MangasGridSectionProps) {
  if (!mangas || mangas.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold fg-primary">{title}</h2>

        {href && (
          <LinkButton variant="ghost" href={href} className="text-sm fg-muted">
            View All <ArrowRight size={14} />
          </LinkButton>
        )}
      </div>

      <div
        className="
          grid gap-4
          grid-cols-[repeat(auto-fill,minmax(140px,1fr))]
          sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]
          md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]
          lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]
        "
      >
        {mangas.map((manga: Manga) => (
          <MangaCard key={manga.manga_id} manga={manga} />
        ))}
      </div>
    </section>
  );
}

