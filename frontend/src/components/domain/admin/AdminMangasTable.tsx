"use client";
import AdminMangaRow from "./AdminMangaRow";
import { MangaList } from "@/types/manga.type";
import { useWindowWidth } from "@/hooks/useWindowSize";

export default function AdminMangasTable({ mangas }: { mangas: MangaList }) {
  const width = useWindowWidth();
  const isSmallScreen = width !== null && width < 640;

  if (mangas.length === 0) return null;

  const headerClassName = " text-xs fg-muted py-2 pr-2";
  const smHeaderClassName = `${headerClassName} text-left hidden  sm:table-cell`;
  const lgHeaderClassName = `${headerClassName} hidden  lg:table-cell`;

  return (
    <section>
      <div className="bg-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-default">
              <th className={`${headerClassName} text-left pl-4`}>
                {isSmallScreen ? "Manga" : "ID"}
              </th>
              <th className={`${smHeaderClassName}`}>Cover</th>
              <th className={`${smHeaderClassName}`}>Title</th>
              <th className={`${lgHeaderClassName} text-left`}>Author</th>
              <th className={`${lgHeaderClassName} text-left`}>Language</th>
              <th className={`${lgHeaderClassName} text-right`}>Likes</th>
              <th className={`${lgHeaderClassName} text-left`}>Date</th>
              <th className={`${headerClassName} text-right pr-4`}>Action</th>
            </tr>
          </thead>

          <tbody>
            {mangas.map((manga, i) => (
              <AdminMangaRow
                key={i}
                manga={manga}
                variant={isSmallScreen ? "list" : "table"}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
