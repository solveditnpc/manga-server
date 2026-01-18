"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParam";
import { Sort } from "@/types/manga.type";
import { isSortValid, DEFAULT_SORT } from "@/utils/sorting.utils";

export default function UrlSorting() {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const paramsSort = searchParams.get("sort");

  const sortBy = (sort: Sort) => {
    if (!isSortValid(sort)) sort = DEFAULT_SORT;
    if (paramsSort === sort) return;
    updateSearchParams({ sort: sort, page: "1" });
  };

  useEffect(() => {
    if (paramsSort !== null && !isSortValid(paramsSort)) sortBy(DEFAULT_SORT);
  }, [paramsSort, updateSearchParams]);

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Label */}
      <span className="fg-muted select-none">Sort By :</span>

      {/* Options */}
      <div className="flex bg-card border border-default rounded-md overflow-hidden">
        <SortButton
          isActive={paramsSort === "date"}
          onClick={() => sortBy("date")}
          title="Latest"
        />

        <SortButton
          isActive={paramsSort === "likes"}
          onClick={() => sortBy("likes")}
          title="Most liked"
        />
      </div>
    </div>
  );
}

interface SortButtonProps {
  isActive: boolean;
  onClick: () => void;
  title: string;
}

function SortButton({ isActive = false, onClick, title }: SortButtonProps) {
  return (
    <button
      className={`px-3 py-1 transition-colors cursor-pointer ${
        isActive ? "fg-primary bg-card-hover" : "fg-muted hover:fg-primary"
      }`}
      onClick={onClick}
      type="button"
    >
      {title}
    </button>
  );
}
