"use client";

import { useEffect, useState } from "react";
import mockMangas from "@/mockData/mangas.json";
import { Manga, MangaList } from "@/types/manga.type";

import {
  AdminAddMangaForm,
  AdminMangaList,
  AdminMangaDetailPanel,
} from "@/features/admin/components";
import { Input } from "@/components/ui";

export default function AdminPage() {
  const [query, setQuery] = useState("");
  const [mangas, setMangas] = useState<MangaList>([]);
  const [loading, setLoading] = useState(false);

  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);

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
        m.tags?.some((t) =>
          t.name.toLowerCase().includes(query.toLowerCase())
        )
    );

    setMangas(filtered);
    setLoading(false);
  }

  const onDelete = (id: number) => {
    setMangas((prev) => prev.filter((m) => m.manga_id !== id));
    if (selectedManga?.manga_id === id) {
      setSelectedManga(null);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Main column */}
      <div className="flex-1 space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-lg font-semibold fg-primary">
            Manga Management
          </h1>
          <p className="text-sm fg-muted">
            Search, add, or delete mangas.
          </p>
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

        {/* List */}
        <AdminMangaList
          mangas={mangas}
          onDelete={onDelete}
          onSelectManga={setSelectedManga}
          selectedId={selectedManga?.manga_id}
        />
      </div>

      {/* Side panel */}
      {selectedManga && (
        <AdminMangaDetailPanel
          manga={selectedManga}
          onClose={() => setSelectedManga(null)}
        />
      )}
    </div>
  );
}
