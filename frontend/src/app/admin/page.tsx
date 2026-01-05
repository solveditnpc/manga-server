"use client";

import { useEffect, useState } from "react";
import mockMangas from "@/mockData/mangas.json";
import { MangaList } from "@/types/manga.type";

import { AdminAddMangaForm, AdminMangaList } from "@/features/admin/components";
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
        m.author.toLowerCase().includes(query.toLowerCase()) ||
        m.language.toLocaleLowerCase().includes(query.toLowerCase()) ||
        m.tags.some((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    );

    setMangas(filtered);

    setLoading(false);
  }

  const onDelete = (id: number) => {
    setMangas(mangas.filter((m) => m.manga_id !== id));
  };

  return (
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
          placeholder="Search by ID, title, or author…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          disabled={loading}
        />
      </section>

      {/* List */}
      <AdminMangaList mangas={mangas} onDelete={onDelete} />
    </div>
  );
}
