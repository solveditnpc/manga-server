"use client";
import { Pagination } from "../ui";
import { useSearchParams } from "next/navigation";
import { clampPage, isPageInRange } from "@/utils/pagination";
import { useEffect } from "react";
import { useUpdateSearchParam } from "@/hooks/useUpdateSearchParam";
interface UrlPaginationProps {
  totalPages: number;
  windowSize?: number;
}

export default function UrlPagination({
  totalPages,
  windowSize,
}: UrlPaginationProps) {
  const searchParams = useSearchParams();
  const updateSearchParam = useUpdateSearchParam();
  const currentPage: number = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    if (!isPageInRange(currentPage, totalPages))
      goToPage(clampPage(currentPage, totalPages));
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    if (currentPage === page) return;
    page = clampPage(page, totalPages);
    updateSearchParam("page", String(page));
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={goToPage}
      windowSize={windowSize}
    />
  );
}
