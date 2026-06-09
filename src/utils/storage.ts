import type { Note } from '../types';

const STORAGE_KEY = 'sticky-notes:v1';

/** Runtime guard so corrupt or out-of-date persisted data can't crash the app. */
const isNote = (value: unknown): value is Note => {
  if (typeof value !== 'object' || value === null) return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === 'string' &&
    typeof n.x === 'number' &&
    typeof n.y === 'number' &&
    typeof n.width === 'number' &&
    typeof n.height === 'number' &&
    typeof n.color === 'string' &&
    typeof n.text === 'string' &&
    typeof n.zIndex === 'number'
  );
};

export const loadNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isNote) : [];
  } catch {
    return [];
  }
};

export const saveNotes = (notes: Note[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Ignore quota / serialization errors — persistence is best-effort.
  }
};
