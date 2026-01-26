"use client";
import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { delay } from "@/_mock/mockPromise";

export default function AdminAddMangaSection() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    try {
      setLoading(true);
      setStatus(null);

      await delay(1000);
      setStatus({ type: "success", message: `Queued: ${value}` });
      setValue("");
    } catch (e: any) {
      setStatus({
        type: "error",
        message: `Failed to add manga ${e?.message || ""}`,
      });
    } finally {
      setLoading(false);
    }
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

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Adding…" : "Add"}
        </Button>
      </form>

      {status && (
        <p
          className={`mt-2 text-xs ${
            status.type === "success" ? "fg-success" : "fg-danger"
          }`}
        >
          {status.message}
        </p>
      )}
    </section>
  );
}
