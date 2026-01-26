"use client";
import { useState, useEffect, useRef } from "react";
import AdminMangasTable from "./AdminMangasTable";
import { MangaList } from "@/types/manga.type";
import { MangaDetailsProvider } from "@/components/overlays/mangaDetails/MangaDetailsContext";
import UrlPagination from "@/components/query/UrlPagination";
import UrlSearch from "@/components/query/UrlSearch";
import UrlSorting from "@/components/query/UrlSorting";
import { AdminMagnaDeleteContextProvider } from "@/components/domain/admin/AdminDeleteMangaContext";
import { Loader, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { listMangas, DEFAULT_PAGE_SIZE } from "@/client/mangas.client";

export default function AdminMangaSection({
  initialMangas,
  totalBatches,
  currentParams,
}: {
  initialMangas: MangaList;
  totalBatches: number;
  currentParams: { page: number; query: string; sort: string };
}) {
  const [mangas, setMangas] = useState<MangaList>(initialMangas);
  const [fetching, setFetching] = useState(false);
  const [isDeletingIdle, setIsDeletingIdle] = useState<boolean>(false);
  const firstRender = useRef(true);
  const { page } = currentParams;

  const handleFetchMangas = async () => {
    setFetching(true);
    const currentBatch = await listMangas(currentParams);
    setMangas(currentBatch);
    setFetching(false);
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setMangas([]);
    handleFetchMangas();
  }, [currentParams]);

  useEffect(() => {
    if (fetching || page >= totalBatches) return;

    // immediate fetch call after half of the page is empty during deletes
    if (mangas.length < DEFAULT_PAGE_SIZE / 2) {
      handleFetchMangas();
      return;
    }

    // debounced fetch call after some deletes occured and page is slightlty empty
    // and there is no more deletes in progress.
    if (isDeletingIdle && mangas.length < DEFAULT_PAGE_SIZE) {
      const debounce = setTimeout(() => {
        handleFetchMangas();
      }, 1200);
      return () => clearTimeout(debounce);
    }
  }, [mangas.length, isDeletingIdle, page, totalBatches, fetching]);

  const onDelete = (id: number) =>
    setMangas((prev) => prev.filter((m) => m.manga_id !== id));

  const onRefresh = () => handleFetchMangas();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <h2 className=" text-lg font-medium fg-primary">Existing Mangas</h2>
          <Button
            onClick={onRefresh}
            className="aspect-square p-1.5! group"
            disabled={fetching}
            title="Refresh"
          >
            <RefreshCcw
              size={14}
              className={`stroke-muted group-hover:stroke-primary ${
                fetching ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>
        <UrlSorting />
      </div>
      {/* Search */}

      <UrlSearch
        inputProps={{ placeholder: "Search by ID, title, author, tag…" }}
        debounced
      />
      <MangaDetailsProvider>
        <AdminMagnaDeleteContextProvider
          onDeleteComplete={onDelete}
          setIsIdle={setIsDeletingIdle}
        >
          <AdminMangasTable mangas={mangas} />
        </AdminMagnaDeleteContextProvider>
      </MangaDetailsProvider>

      {fetching ? (
        <div className="flex items-center justify-center">
          <Loader className="animate-spin" />
        </div>
      ) : (
        mangas.length === 0 && (
          <div className="flex items-center justify-center">
            <span className="text-sm fg-muted">No mangas found</span>
          </div>
        )
      )}
      <UrlPagination totalPages={totalBatches} />
    </section>
  );
}
