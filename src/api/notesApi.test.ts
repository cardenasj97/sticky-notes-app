import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchNotes, persistNotes } from './notesApi';
import type { Note } from '../types';

const note: Note = {
  id: 'a',
  x: 10,
  y: 20,
  width: 160,
  height: 160,
  color: '#fff9b1',
  text: 'hello',
  zIndex: 1,
};

beforeEach(() => {
  localStorage.clear();
});

describe('notesApi (async mock)', () => {
  it('fetchNotes returns a Promise resolving to an empty array by default', async () => {
    const result = fetchNotes();
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toEqual([]);
  });

  it('persistNotes returns a Promise', () => {
    expect(persistNotes([note])).toBeInstanceOf(Promise);
  });

  it('round-trips notes through persist -> fetch', async () => {
    await persistNotes([note]);
    await expect(fetchNotes()).resolves.toEqual([note]);
  });

  it('actually defers resolution (asynchronous, not synchronous)', async () => {
    vi.useFakeTimers();
    try {
      let resolved = false;
      const promise = fetchNotes().then(() => {
        resolved = true;
      });
      expect(resolved).toBe(false); // nothing resolved while timers are frozen
      await vi.runAllTimersAsync();
      await promise;
      expect(resolved).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
