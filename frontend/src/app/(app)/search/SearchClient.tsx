"use client";
import MangaCard from "@/components/domain/manga/MangaCard";
import { Pagination } from "@/components/ui";
import mockMangas from "@/_mock/mangas.json";
import { Manga, MangaList, MangaTag } from "@/types/manga.type";
import { useSearchParams, useRouter } from "next/navigation";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") === "likes" ? "likes" : "date";

  if (!query) {
    return (
      <div className="max-w-6xl min-h-screen mx-auto px-4 py-16 text-center">
        <p className="fg-muted text-sm">Search for a manga by title.</p>
      </div>
    );
  }

  const mangas: MangaList = mockMangas.mangas.filter(
    (manga: Manga) =>
      manga.title.toLowerCase().includes(query.toLowerCase()) ||
      manga.author?.toLowerCase().includes(query.toLowerCase()) ||
      manga.tags?.some((tag: MangaTag) =>
        tag?.name.toLowerCase().includes(query.toLowerCase())
      ) ||
      manga.language?.toLowerCase().includes(query.toLowerCase()) ||
      manga.manga_id.toString().includes(query.toLowerCase())
  );
  const totalPages = 5;

  if (!mangas.length) {
    return (
      <div className="max-w-6xl  min-h-screen mx-auto px-4 py-16 text-center">
        <p className="fg-muted text-sm">No results found for “{query}”.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl min-h-screen mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        {/* Search Meta */}
        <h1 className="text-sm fg-muted">Results for “{query}”</h1>

        {/* Sort */}
        <div className="flex items-center gap-2 text-sm">
          {/* Label */}
          <span className="fg-muted">Sort By :</span>

          {/* Options */}
          <div className="flex bg-card border border-default rounded-md overflow-hidden">
            <button
              className={`px-3 py-1 transition-colors ${
                sort === "date"
                  ? "fg-primary bg-card-hover"
                  : "fg-muted hover:fg-primary"
              }`}
              onClick={() => {
                router.push(`/search?q=${query}&sort=date&page=1`);
              }}
            >
              Latest
            </button>

            <button
              className={`px-3 py-1 transition-colors ${
                sort === "likes"
                  ? "fg-primary bg-card-hover"
                  : "fg-muted hover:fg-primary"
              }`}
              onClick={() => {
                router.push(`/search?q=${query}&sort=likes&page=1`);
              }}
            >
              Most liked
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div
        className="
            grid
            gap-4
            grid-cols-[repeat(auto-fill,minmax(140px,1fr))]
            sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]
            md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]
            lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]
          "
      >
        {mangas.map((manga) => (
          <MangaCard key={manga.manga_id} manga={manga} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(page) => {
              router.push(`/search?q=${query}&page=${page}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}
    </div>
  );
}

