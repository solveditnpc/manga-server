"use client";
import { Pagination, SafeImage } from "@/components/ui";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getMockPagesArray } from "@/_mock/mockPages";
import { delay } from "@/_mock/mockPromise";

export default function PagesPreviewSection({
  manga_id,
  total_pages,
}: {
  manga_id: number;
  total_pages: number;
}) {
  const BATCH_SIZE = 15;

  const [currentBatch, setCurrentBatch] = useState(1);
  const totalBatches = Math.ceil(total_pages / BATCH_SIZE);

  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async function () {
      // fetch call here

      setLoading(true);
      await delay(1000);
      const data = getMockPagesArray(BATCH_SIZE);

      if (!cancelled) {
        setPages(data);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentBatch, manga_id]);

  return (
    <div className="flex flex-col gap-4 lg:p-2 lg:border border-default rounded items-center">
      {/* Grid */}
      <div className="w-full grid gap-2 grid-cols-[repeat(3,1fr)] md:grid-cols-[repeat(5,minmax(120px,1fr))]">
        {loading ? (
          /* Skeleton loader */
          Array.from({ length: BATCH_SIZE }).map((_, i) => (
            <div
              key={i}
              className="aspect-2/3 bg-card border border-default rounded animate-pulse"
            />
          ))
        ) : pages.length === 0 ? (
          /* Empty state */
          <div className="col-span-full text-sm fg-muted text-center py-6">
            No preview pages available.
          </div>
        ) : (
          /* Pages */
          pages.map((page, i) => {
            const pageIndex = i + (currentBatch - 1) * BATCH_SIZE + 1;

            return (
              <Link
                key={pageIndex}
                href={`/read/${manga_id}?page=${pageIndex}`}
                className="relative aspect-2/3 bg-card border border-default rounded overflow-hidden"
              >
                <SafeImage
                  src={page}
                  alt={`Page ${pageIndex}`}
                  fill
                  quality={40}
                  sizes="
                    (max-width: 768px) 33vw,
                    (max-width: 1024px) 20vw,
                    120px
                  "
                  fallbackMsg="Unable to load page"
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
          currentPage={currentBatch}
          totalPages={totalBatches}
          onPageChange={setCurrentBatch}
        />
      )}
    </div>
  );
}
