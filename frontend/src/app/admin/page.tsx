"use client";

import { useEffect, useState } from "react";
import mockMangas from "@/_mock/mangas.json";
import { Manga, MangaList } from "@/types/manga.type";
import AdminAddMangaForm from "@/components/domain/admin/AdminAddMangaForm";
import AdminMangaListPanel from "@/components/domain/admin/AdminMangaListPanel";
import { MangaDetailsProvider } from "@/components/overlays/mangaDetails/MangaDetailsContext";
import { Input } from "@/components/ui";
export default function AdminPage() {
  const [query, setQuery] = useState("");
  const [mangas, setMangas] = useState<MangaList>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMangas();
  }, [query]);

  async function fetchMangas() {
    setLoading(true);

    const filtered = mockMangas.mangas.filter(
      (m) =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.manga_id.toString().includes(query) ||
        m.author?.toLowerCase().includes(query.toLowerCase()) ||
        m.language?.toLowerCase().includes(query.toLowerCase()) ||
        m.tags?.some((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    );

    setMangas(filtered);
    setLoading(false);
  }

  const onDelete = (id: number) => {
    setMangas((prev) => prev.filter((m) => m.manga_id !== id));
  };

  return (
    <>
      {/* Main content */}
      <div className="space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-lg font-semibold fg-primary">Manga Management</h1>
          <p className="text-sm fg-muted">Search, add, or delete mangas.</p>
        </section>

        {/* Add */}
        <section className="bg-card border border-default rounded-lg p-4">
          <AdminAddMangaForm />
        </section>

        {/* Search */}
        <section>
          <Input
            type="search"
            placeholder="Search by ID, title, author, tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
        </section>
        <MangaDetailsProvider>
          {/* List */}
          <AdminMangaListPanel
            mangas={mangas}
            onDelete={onDelete}
          />
        </MangaDetailsProvider>
      </div>
    </>
  );
}
