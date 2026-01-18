import { Sort } from "@/types/manga.type";

export const isSortValid = (val: string | null): val is Sort =>
  val === "date" || val === "likes";

export const DEFAULT_SORT: Sort = "date";
