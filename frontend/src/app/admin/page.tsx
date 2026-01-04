import { Search } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { AdminAddMangaForm } from "@/features/admin/components";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section>
        <h1 className="text-lg font-semibold fg-primary">Manga Management</h1>
      </section>

      {/* Add New Manga */}
      <div className="mt-3">
        <AdminAddMangaForm />
      </div>

      {/* Search */}
      <section className="flex gap-2">
        <Input type="search" placeholder="Search by title or manga ID…" />
        <Button>
          <Search className="mr-2" />
        </Button>
      </section>

      {/* Manga List */}
      <section className="bg-card border border-default rounded-lg">
        <div className="px-4 py-2 border-b border-default">
          <h2 className="text-sm font-medium fg-primary">Existing Mangas</h2>
        </div>

        {/* AdminMangaList will live here */}
        <div className="divide-y divide-(--border)">
          <div className="px-4 py-3 text-sm fg-muted italic">
            Manga rows go here
          </div>
        </div>
      </section>
    </div>
  );
}
