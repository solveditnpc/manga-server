import { delay } from "@/_mock/mockPromise";
import mockMangas from "@/_mock/mangas.json";
import { MangaList } from "@/types/manga.type";

// Mock Mangas Array
function _getMockMangasArray(size: number): MangaList {
  const baseMangas = mockMangas.mangas;
  const len = baseMangas.length;

  const START_DATE = Date.parse("2025-01-01T00:00:00Z"); // anchor
  const DAY_MS = 24 * 60 * 60 * 1000;

  const result: MangaList = [];

  for (let i = 0; i < size; i++) {
    const base = baseMangas[i % len];

    const copy = {
      ...base,
      manga_id: base.manga_id + Math.floor(i / len) * len,

      // deterministic but varied
      likes_count: 100 + ((i * 37) % 5000),

      // spread dates forward, one per item
      created_date: new Date(START_DATE + i * DAY_MS).toISOString(),
    };

    result.push(copy);
  }

  return result;
}

let ALL_MANGAS = _getMockMangasArray(50);
export const DEFAULT_PAGE_SIZE = 15;
export const TOTAL_PAGES = Math.ceil(ALL_MANGAS.length / DEFAULT_PAGE_SIZE);

interface listMangasProps {
  page: number;
  query: string;
  sort: string;
}

export async function listMangas({
  page,
  query,
  sort,
}: listMangasProps): Promise<MangaList> {
  await delay(1000);
  const filtered = ALL_MANGAS.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.manga_id.toString().includes(query) ||
      m.author?.toLowerCase().includes(query.toLowerCase()) ||
      m.language?.toLowerCase().includes(query.toLowerCase()) ||
      m.tags?.some((t) => t.name.toLowerCase().includes(query.toLowerCase())),
  ).sort((a, b) => {
    if (sort === "likes") return (b?.likes_count || 0) - (a?.likes_count || 0);

    const dateDiff =
      Number(new Date(a.created_date)) - Number(new Date(b.created_date));

    return -1 * dateDiff;
  });

  const start = (page - 1) * DEFAULT_PAGE_SIZE;
  const end = start + DEFAULT_PAGE_SIZE;
  return filtered.slice(start, end);
}

export async function deleteManga(id: number) {
  await delay(1000);
  ALL_MANGAS = ALL_MANGAS.filter((m) => m.manga_id !== id);
}
