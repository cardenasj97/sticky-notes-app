import type { Note } from '../types';
import { loadNotes, saveNotes } from '../utils/storage';

/**
 * Mock REST client for notes. There is no real server: `localStorage` (via the
 * storage helpers) acts as the backing store, and every call is wrapped in
 * artificial latency so the persistence layer behaves asynchronously — exactly
 * like a `fetch`-backed API would.
 */

const LATENCY_MS = 250;

const delay = <T>(value: T, ms = LATENCY_MS): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/** GET /notes */
export const fetchNotes = (): Promise<Note[]> => delay(loadNotes());

/** PUT /notes — whole-collection save, matching the in-app data model. */
export const persistNotes = (notes: Note[]): Promise<void> =>
  delay(undefined).then(() => saveNotes(notes));
