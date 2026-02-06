"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Pagination, SafeImage } from "@/components/ui";
import { useServerContext } from "@/components/domain/server/ServerContext";

import { toSearchParamsString } from "@/utils/params.utils";

export default function PagesPreviewSection({
  manga_id,
  total_pages,
  pages,
}: {
  manga_id: number;
  total_pages: number;
  pages: string[];
}) {
  const BATCH_SIZE = 15;
  const totalBatches = Math.ceil(total_pages / BATCH_SIZE);

  const [page, setPage] = useState<number>(1);
  const [currentBatch, setCurrentBatch] = useState<string[]>(
    pages.slice(0, BATCH_SIZE + 1),
  );
  const { routePrefix } = useServerContext();

  useEffect(() => {
    const start = (page - 1) * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    setCurrentBatch(pages.slice(start, end));
  }, [page]);

  return (
    <div className="flex flex-col gap-4 lg:p-2 lg:border border-default rounded items-center">
      {/* Grid */}
      <div className="w-full grid gap-2 grid-cols-[repeat(3,1fr)] md:grid-cols-[repeat(5,minmax(120px,1fr))]">
        {currentBatch.length === 0 ? (
          /* Empty state */
          <div className="col-span-full text-sm fg-muted text-center py-6">
            No preview pages available.
          </div>
        ) : (
          /* Pages */
          currentBatch.map((p, i) => {
            const pageIndex = i + (page - 1) * BATCH_SIZE + 1;

            return (
              <Link
                key={pageIndex}
                href={`${routePrefix}/read/${manga_id}?${toSearchParamsString({ page: pageIndex })}`}
                className="relative aspect-2/3 bg-card border border-default rounded overflow-hidden"
              >
                <SafeImage
                  src={p}
                  alt={`Page ${pageIndex}`}
                  fill
                  quality={40}
                  sizes="
                    (max-width: 768px) 33vw,
                    (max-width: 1024px) 20vw,
                    120px
                  "
                  fallbackMsg={`Unable to load page ${pageIndex}`}
                />
              </Link>
            );
          })
        )}
      </div>

      <div className="border-t border-default w-full" />

      {/* Pagination */}
      {pages.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalBatches}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
