"use client";
import { Pagination } from "@/components/ui";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMockPagesArray } from "@/mockData/mockPages";

export default function PagesPreviewGrid({
  page_files,
  manga_id,
}: {
  page_files: any[];
  manga_id: number;
}) {
  page_files = getMockPagesArray(page_files.length);
  const totalPages = Math.ceil(page_files.length / 15);
  const [currentPage, setCurrentPage] = useState(1);
  const current_pages_files = page_files.slice(
    (currentPage - 1) * 15,
    (currentPage - 1) * 15 + 15
  );

  return (
    <div
      className="
        flex flex-col
        gap-4 lg:p-2
        lg:border border-default
        rounded
        items-center
      "
    >
      <div
        className="
          w-full
          grid gap-2
          grid-cols-[repeat(3,1fr)]
          md:grid-cols-[repeat(5,minmax(120px,1fr))]
        "
      >
        {current_pages_files.map((page, i) => (
          <Link
            href={`/read/${manga_id}?page=${i + (currentPage - 1) * 15 + 1}`}
            key={i}
            className={`"
            relative
            aspect-2/3
            bg-card
            border border-default
            rounded
            overflow-hidden
            "` + i}
          >
            {page ? (
              <Image
                src={page}
                alt={`Page ${i + (currentPage - 1) * 15 + 1}`}
                fill
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs fg-muted">
                Page {i + (currentPage - 1) * 15 + 1}
              </div>
            )}
          </Link>
        ))}
      </div>
      <div className="border-t border-default w-full"></div>

      <div
        className="
          flex justify-center
          w-full overflow-hidden
          h-7
          lg:h-full
          "
      >
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
