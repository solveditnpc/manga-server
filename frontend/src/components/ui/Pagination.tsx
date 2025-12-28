"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from ".";

// Pagination Button Component :
interface PaginationButtonProps {
  page: number;
  currentPage: number;
  onClick: (page: number) => void;
}

function PaginationButton({
  page,
  currentPage,
  onClick,
}: PaginationButtonProps) {
  const isActive = page === currentPage;

  return (
    <Button
      onClick={() => onClick(page)}
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "bg-card fg-primary font-medium"
          : "bg-card fg-muted hover-card"
      }
    >
      {page}
    </Button>
  );
}

// Pagination Component :
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const windowSize = 5;

  let start = Math.max(1, currentPage - 2);
  let end = start + windowSize - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - windowSize + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const prevNextClassname =
    "fg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center  gap-1";

  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Pagination">
      {/* Prev */}
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={prevNextClassname}
      >
        <ChevronLeft size={16} />
        Prev
      </Button>

      <div className="flex gap-1 justify-center items-center w-100">
        {/* First page shortcut */}
        {start > 1 && (
          <>
            <PaginationButton
              page={1}
              currentPage={currentPage}
              onClick={onPageChange}
            />
            <span className="px-1 fg-muted">…</span>
          </>
        )}

        {/* Window pages */}
        {pages.map((page) => (
          <PaginationButton
            key={page}
            page={page}
            currentPage={currentPage}
            onClick={onPageChange}
          />
        ))}

        {/* Last page shortcut */}
        {end < totalPages && (
          <>
            <span className="px-1 fg-muted">…</span>
            <PaginationButton
              page={totalPages}
              currentPage={currentPage}
              onClick={onPageChange}
            />
          </>
        )}
      </div>
      {/* Next */}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={prevNextClassname}
      >
        Next
        <ChevronRight size={16} />
      </Button>
    </nav>
  );
}
