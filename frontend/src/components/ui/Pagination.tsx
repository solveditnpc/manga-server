"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Pagination Component :
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  windowSize?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  windowSize = 5,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - half);
  let end = start + windowSize - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - windowSize + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      className="flex gap-1 items-center justify-center py-2"
      aria-label="Pagination"
    >
      {/* Prev */}
      <PaginationButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:block"> Prev</span>
      </PaginationButton>

      <div
        className="
          flex gap-1 
          justify-center items-center 
          md:w-100
          "
      >
        {/* First page shortcut */}
        {start > 1 && (
          <>
            <PaginationButton
              isActive={currentPage === 1}
              onClick={() => onPageChange(1)}
              aria-label={`Page ${1}`}
            >
              1
            </PaginationButton>
            <span className="fg-muted text-sm select-none">…</span>
          </>
        )}

        {/* Window pages */}
        {pages.map((page) => (
          <PaginationButton
            key={page}
            isActive={currentPage === page}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
          >
            {page}
          </PaginationButton>
        ))}

        {/* Last page shortcut */}
        {end < totalPages && (
          <>
            <span className="fg-muted text-sm select-none">…</span>
            <PaginationButton
              isActive={currentPage === totalPages}
              onClick={() => onPageChange(totalPages)}
              aria-label={`Page ${totalPages}`}
            >
              {totalPages}
            </PaginationButton>
          </>
        )}
      </div>
      {/* Next */}
      <PaginationButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <span className="hidden sm:block">Next </span>
        <ChevronRight size={16} />
      </PaginationButton>
    </nav>
  );
}

// Pagination Button Component :
interface PaginationButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

function PaginationButton({
  children,
  isActive = false,
  ...props
}: PaginationButtonProps) {
  const { type, className = "", onClick, ...rest } = props;
  return (
    <button
      onClick={onClick}
      type={type || "button"}
      className={`
        flex items-center justify-center
        bg-card hover-card 
        border border-default 
        rounded-md cursor-pointer
        md:text-sm text-xs 
        md:h-9 h-7 
        md:min-w-9 min-w-7 px-2
        disabled:disabled-default 
        focus-ring
        ${isActive ? "fg-primary border-light" : "fg-muted"}
        ${className}
      `}
      aria-current={isActive ? "page" : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
