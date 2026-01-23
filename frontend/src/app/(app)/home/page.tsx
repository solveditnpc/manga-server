import HorizontalScroller from "@/components/sections/HorizontalScroller";
import MangasGridSection from "@/components/sections/MangasGridSection";
import MangaCard from "@/components/domain/manga/MangaCard";
import ContinueMangaCard from "@/components/domain/manga/ContinueMangaCard";
import {
  listContinueMangas,
  listLikedMangas,
  listMangas,
} from "@/client/mangas.client";
import { LinkButton } from "@/components/ui";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  // Independent fetches (do NOT couple them)
  const [newMangas, likedMangas, continueMangas] = await Promise.all([
    listMangas({ page: 1, query: "", sort: "date" }),
    listLikedMangas({ page: 1 }),
    listContinueMangas({ page: 1 }),
  ]);

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
      <HorizontalScroller title="Continue Reading" href="/continue?page=1">
        {continueMangas.map((manga) => (
          <ContinueMangaCard
            key={manga.manga_id}
            manga={manga}
            disableActions
          />
        ))}
      </HorizontalScroller>

      {/* Bookmarked */}
      <HorizontalScroller title="Liked By You" href="/liked?page=1">
        {likedMangas.map((manga) => (
          <MangaCard key={manga.manga_id} manga={manga} />
        ))}
      </HorizontalScroller>

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
