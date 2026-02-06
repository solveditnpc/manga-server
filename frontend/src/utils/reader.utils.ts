import { ContinueProgress } from "@/types/manga.type";

export function clampCheckpoint(
  checkpoint: unknown,
): ContinueProgress["checkpoint"] {
  const numCheckPnt = Number(checkpoint);
  if (numCheckPnt > 1) return 1;
  if (numCheckPnt > 0.75) return 0.75;
  if (numCheckPnt > 0.5) return 0.5;
  if (numCheckPnt > 0.25) return 0.25;
  return 0;
}

export function getProgress(pageEl: HTMLElement): number {
  const rect = pageEl.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  const totalScrollable = rect.height - viewportHeight;
  if (totalScrollable <= 0) return 1;

  const scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);

  return scrolled / totalScrollable;
}
