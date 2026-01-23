import { delay } from "@/_mock/mockPromise";
import mockMangas from "@/_mock/mangas.json";
import { Manga, MangaList, ContinueManga } from "@/types/manga.type";

// AI generated mockMangasArray creator :)
// simple deterministic PRNG (Mulberry32)
const createRng = (seed: number) => {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const rng = createRng(12345);

// Mock Mangas Array
const _getMockMangasArray = (size: number): MangaList => {
  const baseMangas = mockMangas.mangas;
  const len = baseMangas.length;

  const START_DATE = Date.parse("2023-01-01T00:00:00Z");
  const END_DATE = Date.parse("2025-12-31T23:59:59Z");
  const DATE_RANGE = END_DATE - START_DATE;

  const result: MangaList = [];

  for (let i = 0; i < size; i++) {
    const base = baseMangas[i % len];

    const randomLikes = Math.floor(50 + rng() * 2000); // 50 → 2k
    const randomDate = new Date(START_DATE + rng() * DATE_RANGE).toISOString();

    result.push({
      ...base,
      manga_id: base.manga_id + Math.floor(i / len) * len,
      likes_count: randomLikes,
      created_date: randomDate,
    });
  }

  return result;
};

// Mock Mangas DataSet
let ALL_MANGAS = _getMockMangasArray(100);
let LIKED_MANGAS = _getMockMangasArray(50);
let CONTINUE_MANGAS = _getMockMangasArray(50).map((manga) => {
  const minPage = Math.ceil(manga.total_pages * 0.1);
  const maxPage = Math.floor(manga.total_pages * 0.8);
  const page = minPage + Math.floor(rng() * (maxPage - minPage + 1));

  return {
    ...manga,
    href: `/read/${manga.manga_id}?page=${page}`,
  };
});

export const DEFAULT_PAGE_SIZE = 15;

// Get total number of pages
export async function getTotalPages(scope: "all" | "liked" | "continue") {
  await delay(200);
  let len = 0;

  switch (scope) {
    case "all":
      len = ALL_MANGAS.length;
    case "liked":
      len = LIKED_MANGAS.length;
    case "continue":
      len = CONTINUE_MANGAS.length;
  }

  return Math.ceil(len / DEFAULT_PAGE_SIZE);
}

// All Mangas
export async function listMangas({
  page,
  query,
  sort,
}: {
  page: number;
  query: string;
  sort: string;
}): Promise<MangaList> {
  await delay(500);
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

// Delete Manga
export async function deleteManga(id: number) {
  await delay(500);
  ALL_MANGAS = ALL_MANGAS.filter((m) => m.manga_id !== id);
}

// Continue Mangas
export async function listContinueMangas({
  page,
}: {
  page: number;
}): Promise<ContinueManga[]> {
  await delay(500);
  const start = (page - 1) * DEFAULT_PAGE_SIZE;
  const end = start + DEFAULT_PAGE_SIZE;
  return CONTINUE_MANGAS.slice(start, end);
}

// Remove Continue Manga
export async function removeContinueManga(id: number) {
  await delay(500);
  CONTINUE_MANGAS = CONTINUE_MANGAS.filter((m) => m.manga_id !== id);
}

// Liked Mangas
export async function listLikedMangas({
  page,
}: {
  page: number;
}): Promise<MangaList> {
  await delay(500);
  const start = (page - 1) * DEFAULT_PAGE_SIZE;
  const end = start + DEFAULT_PAGE_SIZE;
  return LIKED_MANGAS.slice(start, end);
}

// Unlike Manga
export async function unlikeManga(id: number) {
  await delay(500);
  LIKED_MANGAS = LIKED_MANGAS.filter((m) => m.manga_id !== id);
}

// Get Manga
export async function getMangaById(
  id: Manga["manga_id"],
): Promise<Manga | undefined> {
  await delay(500);
  return ALL_MANGAS.find((m) => m.manga_id === id);
}

export async function getMangaPagesById(
  id: Manga["manga_id"],
): Promise<string[]> {
  await delay(500);
  const manga = await getMangaById(id);
  if (!manga) return [];

  const mock_pages = [
    "/mock-pages/page-0.jpg",
    "/mock-pages/page-1.jpg",
    "/mock-pages/page-2.jpg",
    "/mock-pages/page-3.jpg",
    "/mock-pages/page-4.jpg",
  ];

  let array = [];
  for (let i = 0; i < manga.total_pages; i++) {
    array.push(mock_pages[i % 5]);
  }

  return array;
}

/*TODO : Read about automatic fetch caching in next */
