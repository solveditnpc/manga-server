import HorizontalScroller from "@/components/sections/HorizontalScroller";
import MangasGridSection from "@/components/sections/MangasGridSection";
import MangaCard from "@/components/domain/manga/MangaCard";
import ContinueMangaCard from "@/components/domain/manga/ContinueMangaCard";
import { LinkButton } from "@/components/ui";

import {
  listMangas,
  listContinueMangas,
  listLikedMangas,
} from "@/server/manga/manga.action";
import { ContinueManga, Manga } from "@/types/manga.type";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const [newMangasRes, likedMangasRes, continueMangasRes] = await Promise.all([
    listMangas({ page: 1, query: "", sort: "date", server: "S" }),
    listLikedMangas({ page: 1 }),
    listContinueMangas({ page: 1, server: "S" }),
  ]);

  let newMangas: Manga[] = [];
  let continueMangas: ContinueManga[] = [];
  let likedMangas: Manga[] = [];

  if (newMangasRes.ok) newMangas = newMangasRes.value.mangas;
  if (continueMangasRes.ok) continueMangas = continueMangasRes.value.mangas;
  if (likedMangasRes.ok) likedMangas = likedMangasRes.value.mangas;
  return (
    <main className="max-w-7xl mx-auto px-4 py-4 space-y-2">
      {/* Greeting */}

      <section
        className="
          rounded-xl
          bg-card
          py-4
          text-center
          space-y-2
          ambient-gradient
        "
      >
        <p className="text-sm uppercase tracking-widest fg-muted">
          Welcome back
        </p>

        <p className="text-xl font-semibold fg-primary">
          Good evening, {"{ NAME }"}
        </p>

        <p className="text-sm fg-muted">Your library is waiting.</p>
      </section>

      {/* Continue Reading */}
      {continueMangas.length > 0 && (
        <HorizontalScroller title="Continue Reading" href="/continue?page=1">
          {continueMangas.map((manga) => (
            <div
              className="
                w-35
                sm:w-40
                md:w-45
                lg:w-50
              "
            >
              <ContinueMangaCard
                key={manga.manga_id}
                manga={manga}
                disableActions
              />
            </div>
          ))}
        </HorizontalScroller>
      )}

      {/* Bookmarked */}
      {likedMangas.length > 0 && (
        <HorizontalScroller title="Liked By You" href="/liked?page=1">
          {likedMangas.map((manga) => (
            <div
              className="
                w-35
                sm:w-40
                md:w-45
                lg:w-50
              "
            >
              <MangaCard key={manga.manga_id} manga={manga} />
            </div>
          ))}
        </HorizontalScroller>
      )}

      {/* New Uploads */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold fg-primary">{"New Uploads"}</h2>
        <LinkButton
          variant="ghost"
          href={"/browse?page=1&sort=date"}
          className="text-sm fg-muted"
        >
          View All <ArrowRight size={14} />
        </LinkButton>
      </div>
      <MangasGridSection>
        {newMangas.map((manga) => (
          <MangaCard key={manga.manga_id} manga={manga} />
        ))}
      </MangasGridSection>
    </main>
  );
}
