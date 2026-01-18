"use client";
import { Pagination } from "../ui";
import { useSearchParams } from "next/navigation";
import { clampPage, isPageValid } from "@/utils/pagination.utils";
import { useEffect } from "react";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParam";
interface UrlPaginationProps {
  totalPages: number;
  windowSize?: number;
}

export default function UrlPagination({
  totalPages,
  windowSize,
}: UrlPaginationProps) {
  const searchParams = useSearchParams();
  const updateSearchParam = useUpdateSearchParams();
  const currentPage: number = Number(searchParams.get("page")) || 1;

  const goToPage = (page: number) => {
    if (currentPage === page) return;
    page = clampPage(page, totalPages, 1);
    updateSearchParam({ page: String(page) });
  };

  useEffect(() => {
    if (!isPageValid(currentPage, totalPages))
      goToPage(clampPage(currentPage, totalPages, 1));
  }, [currentPage, totalPages]);

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={goToPage}
      windowSize={windowSize}
    />
  );
}
