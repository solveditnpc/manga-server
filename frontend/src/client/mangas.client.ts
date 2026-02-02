import { delay } from "@/_mock/mockPromise";
import mockMangas from "@/_mock/mangas.json";
import { Manga } from "@/types/manga.type";
import { DEFAULT_PAGE_SIZE } from "@/config/manga.config";

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
const _getMockMangasArray = (size: number): Manga[] => {
  const baseMangas = mockMangas.mangas;
  const len = baseMangas.length;

  const START_DATE = Date.parse("2023-01-01T00:00:00Z");
  const END_DATE = Date.parse("2025-12-31T23:59:59Z");
  const DATE_RANGE = END_DATE - START_DATE;

  const result: Manga[] = [];

  for (let i = 0; i < size; i++) {
    const base = baseMangas[i % len];

    const randomLikes = Math.floor(50 + rng() * 2000); // 50 → 2k
    const randomDate = new Date(START_DATE + rng() * DATE_RANGE).toISOString();

    result.push({
      ...base,
      manga_id: base.manga_id + Math.floor(i / len) * len,
      like_count: randomLikes,
      download_timestamp: randomDate,
    });
  }

  return result;
};

// Mock Mangas DataSet
let LIKED_MANGAS = _getMockMangasArray(50);


// Get total number of pages
export async function getTotalPages(scope: "all" | "liked" | "continue") {
  await delay(200);
  let len = 0;

  switch (scope) {
    case "liked":
      len = LIKED_MANGAS.length;
  }

  return Math.ceil(len / DEFAULT_PAGE_SIZE);
}

// Liked Mangas
export async function listLikedMangas({
  page,
}: {
  page: number;
}): Promise<Manga[]> {
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