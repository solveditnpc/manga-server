export function clampPage(
  page: unknown,
  totalPages: number,
  fallbackPage: number = 1,
): number {
  const num = Number(page);
  if (!Number.isInteger(num)) return fallbackPage;
  if (num < 1) return 1;
  if (totalPages > 0 && num > totalPages) return totalPages;
  return num;
}
export function isPageValid(page: unknown, totalPages: number): boolean {
  const num = Number(page);
  if (!Number.isInteger(num)) return false;
  if (num < 1) return false;
  if (totalPages > 0 && num > totalPages) return false;
  return true;
}
