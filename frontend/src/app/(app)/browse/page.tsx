import MangaCard from "@/components/dashboard/MangaCard";
import mockMangas from "../../../mockData/mangas.json";

export default function DashboardPage() {
  const continueMangas = mockMangas.mangas;
  const allMangas = [...mockMangas.mangas, ...mockMangas.mangas];

  return (
    <main className="max-w-screen mx-auto px-4 py-8 space-y-8">
      {/* Continue Reading */}
      <section className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold fg-primary">Continue Reading</h2>
        </div>

        {/* Horizontal list */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {continueMangas.map((manga) => (
            <MangaCard key={manga.id} {...manga} href="#" />
          ))}
        </div>
      </section>

      {/* Separator */}
      <div className=" w-full border-t-2 border-default" />

      {/* All Manga */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold fg-primary">All Manga</h2>

        <div
          className="
            grid
            gap-4
            grid-cols-[repeat(auto-fill,minmax(140px,1fr))]
            sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]
            md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]
            lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]
            xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]
            2xl:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]
          "
        >
          {allMangas.map((manga, i) => (
            <MangaCard key={i} {...manga} href="#" />
          ))}
        </div>
      </section>

      {/* Pagination */}
      <div className="flex justify-center">{/* Pagination goes here */}</div>
    </main>
  );
}
