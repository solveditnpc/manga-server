export function clampPage(page: number, total_pages: number) {
  if (page < 1) return 1;
  if (total_pages > 0 && page > total_pages) return total_pages;
  return page;
}

export function isPageInRange(page: number, total_pages: number) {
  if (page < 1) return false;
  if (total_pages > 0 && page > total_pages) return false;
  return true;
}