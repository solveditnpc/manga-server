import { Sort } from "@/types/manga.type";

export const isSortValid = (val: string | null): val is Sort =>
  val === "date" || val === "likes";

export const DEFAULT_SORT: Sort = "date";

// arrays soring :
type SortOrder = "latest" | "oldest";

export function compareByDate<T>(
  getDate: (item: T) => Date | string | number | null | undefined,
  order: SortOrder = "latest",
) {
  const factor = order === "oldest" ? 1 : -1;

  return (a: T, b: T): number => {
    const dateA = getDate(a);
    const dateB = getDate(b);

    const timeA = dateA == null ? 0 : new Date(dateA).getTime();
    const timeB = dateB == null ? 0 : new Date(dateB).getTime();

    return (timeA - timeB) * factor;
  };
}

