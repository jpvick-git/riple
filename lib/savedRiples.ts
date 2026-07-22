import type { GenerationDepth } from "@/lib/types";

export const SAVED_RIPLES_KEY = "riple:saved";

export interface SavedRiple {
  id: string;
  title: string;
  prompt: string;
  summary: string;
  depth: GenerationDepth;
  savedAt: string;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function listSavedRiples(): SavedRiple[] {
  if (!canUseStorage()) return [];

  const raw = window.localStorage.getItem(SAVED_RIPLES_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as SavedRiple[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.id === "string" && typeof item.title === "string")
      .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt));
  } catch {
    return [];
  }
}

export function isRipleSaved(id: string): boolean {
  return listSavedRiples().some((item) => item.id === id);
}

export function saveRiple(entry: Omit<SavedRiple, "savedAt"> & { savedAt?: string }): SavedRiple[] {
  const nextEntry: SavedRiple = {
    ...entry,
    savedAt: entry.savedAt ?? new Date().toISOString()
  };
  const existing = listSavedRiples().filter((item) => item.id !== nextEntry.id);
  const next = [nextEntry, ...existing];
  window.localStorage.setItem(SAVED_RIPLES_KEY, JSON.stringify(next));
  return next;
}

export function unsaveRiple(id: string): SavedRiple[] {
  const next = listSavedRiples().filter((item) => item.id !== id);
  window.localStorage.setItem(SAVED_RIPLES_KEY, JSON.stringify(next));
  return next;
}

export function toggleSavedRiple(
  entry: Omit<SavedRiple, "savedAt">
): { saved: boolean; items: SavedRiple[] } {
  if (isRipleSaved(entry.id)) {
    return { saved: false, items: unsaveRiple(entry.id) };
  }
  return { saved: true, items: saveRiple(entry) };
}
