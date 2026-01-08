"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useUpdateSearchParam } from "@/hooks/useUpdateSearchParam";

export type Sort = "date" | "likes";

export default function UrlSorting() {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParam();
  const paramsSort: string = searchParams.get("sort") || "";

  const isValidSort = (sort: string): sort is Sort =>
    sort === "date" || sort === "likes";

  useEffect(() => {
    if (!isValidSort(paramsSort)) sortBy("date");
  }, [paramsSort]);

  const sortBy = (sort: Sort) => {
    if (!isValidSort(sort)) sort = "date";
    if (paramsSort === sort) return;
    updateSearchParams("sort", sort);
  };

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
    >
      {title}
    </button>
  );
}

`feat(component:UrlPagination): add UrlPagination component that sync pagination state with URL`;