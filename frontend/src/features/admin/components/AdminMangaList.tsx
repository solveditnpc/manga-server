"use client";

import { useState, useRef } from "react";
import AdminMangaRow from "./AdminMangaRow";
import { MangaList } from "@/types/manga.type";
import { ConfirmDialog } from "@/components/ui";

export default function AdminMangaList({
  mangas,
  onDelete,
}: {
  mangas: MangaList;
  onDelete: (id: number) => void;
}) {
  const [confirmMsg, setConfirmMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const deleteId = useRef<number | null>(null);

  function openConfirm(manga_id: number, manga_title: string) {
    deleteId.current = manga_id;
    setConfirmMsg(`"${manga_title}" will be permanently removed.`);
  }
  function handleDelete() {
    setConfirmMsg("");
    if (deleteId.current) {
      setLoading(true);

      setTimeout(function () {
        setLoading(false);
        if (deleteId.current) onDelete(deleteId.current);
        deleteId.current = null;
      }, 1000);
    }
  }

  function onCancel() {
    setConfirmMsg("");
    deleteId.current = null;
  }

  if (mangas.length === 0)
    return <div className="fg-muted text-sm">No mangas found.</div>;

  const rowClassName = "text-xs fg-muted py-2 pr-2";

  return (
    <section className="border border-default rounded-lg">
      <h2 className="px-2 py-3 text-sm font-medium fg-primary">
        Existing Mangas
      </h2>
      <div className="px-4 bg-card">
        <table className="w-full border-collapse p-2">
          <thead className="bg-card">
            <tr className="border-b border-default">
              <th className={`${rowClassName} text-left`}>ID</th>
              <th className={`${rowClassName} text-left`}>Cover</th>
              <th className={`${rowClassName} text-left`}>Title</th>
              <th className={`${rowClassName} text-left`}>Author</th>
              <th className={`${rowClassName} text-left`}>Language</th>
              <th className={`${rowClassName} text-right`}>Likes</th>
              <th className={`${rowClassName} text-left`}>Date</th>
              <th className={`${rowClassName} text-right`}>Action</th>
            </tr>
          </thead>

          <tbody>
            {mangas.map((manga) => (
              <AdminMangaRow
                key={manga.manga_id}
                manga={manga}
                onDelete={openConfirm}
                deleting={manga.manga_id === deleteId.current && loading}
              />
            ))}
          </tbody>
        </table>
        <ConfirmDialog
          open={confirmMsg !== ""}
          title="Delete manga?"
          description={confirmMsg}
          confirmText="Delete"
          onCancel={onCancel}
          onConfirm={handleDelete}
        />
      </div>
    </section>
  );
}
