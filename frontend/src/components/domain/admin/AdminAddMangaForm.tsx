"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";

export default function AdminAddMangaForm() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;

    setLoading(true);
    setStatus(null);

    setTimeout(() => {
      setLoading(false);
      setStatus("Added successfully!");
      setValue("");
    }, 1000);
  }

  return (
    <section className="bg-card border border-default rounded-lg p-4">
      <h2 className="text-sm font-semibold fg-primary mb-2">Add New Manga</h2>

      <p className="text-xs fg-muted mb-3">
        Enter a manga ID, author name, or source URL to queue it for download.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 123456, author name, or URL"
          disabled={loading}
        />

        <Button type="submit" disabled={loading || !value.trim()}>
          {loading ? "Adding…" : "Add"}
        </Button>
      </form>

      {status && <p className="mt-2 text-xs fg-muted">{status}</p>}
    </section>
  );
}
