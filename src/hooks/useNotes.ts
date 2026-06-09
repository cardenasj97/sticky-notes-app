import { useEffect, useReducer, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import type { Note, Position, Size } from '../types';
import { fetchNotes, persistNotes } from '../api/notesApi';

export type NotesAction =
  | { type: 'hydrate'; notes: Note[] }
  | { type: 'add'; note: Omit<Note, 'id' | 'zIndex'> }
  | { type: 'move'; id: string; position: Position }
  | { type: 'resize'; id: string; rect: Position & Size }
  | { type: 'updateText'; id: string; text: string }
  | { type: 'setColor'; id: string; color: string }
  | { type: 'bringToFront'; id: string }
  | { type: 'remove'; id: string };

export type NotesDispatch = Dispatch<NotesAction>;

/** Reflects the async persistence layer so the UI can show load/save feedback. */
export type NotesStatus = 'loading' | 'saving' | 'ready';

const SAVE_DEBOUNCE_MS = 300;

const nextZIndex = (notes: Note[]): number =>
  notes.reduce((max, note) => Math.max(max, note.zIndex), 0) + 1;

/** Pure reducer — exported so it can be unit-tested without React. */
export const notesReducer = (state: Note[], action: NotesAction): Note[] => {
  switch (action.type) {
    case 'hydrate':
      return action.notes;
    case 'add':
      return [
        ...state,
        { ...action.note, id: crypto.randomUUID(), zIndex: nextZIndex(state) },
      ];
    case 'move':
      return state.map((note) =>
        note.id === action.id
          ? { ...note, x: action.position.x, y: action.position.y }
          : note,
      );
    case 'resize':
      return state.map((note) =>
        note.id === action.id ? { ...note, ...action.rect } : note,
      );
    case 'updateText':
      return state.map((note) =>
        note.id === action.id ? { ...note, text: action.text } : note,
      );
    case 'setColor':
      return state.map((note) =>
        note.id === action.id ? { ...note, color: action.color } : note,
      );
    case 'bringToFront':
      return state.map((note) =>
        note.id === action.id ? { ...note, zIndex: nextZIndex(state) } : note,
      );
    case 'remove':
      return state.filter((note) => note.id !== action.id);
    default:
      return state;
  }
};

export const useNotes = (): {
  notes: Note[];
  dispatch: NotesDispatch;
  status: NotesStatus;
} => {
  const [notes, dispatch] = useReducer(notesReducer, []);
  const [status, setStatus] = useState<NotesStatus>('loading');

  // The exact notes reference that already lives on the "server". Used to skip
  // the redundant save triggered by the hydrate render (and to never write the
  // initial empty array before the async load has completed).
  const lastLoadedRef = useRef<Note[] | null>(null);

  // Initial async load from the mock API.
  useEffect(() => {
    let active = true;
    fetchNotes().then((loaded) => {
      if (!active) return;
      lastLoadedRef.current = loaded;
      dispatch({ type: 'hydrate', notes: loaded });
      setStatus('ready');
    });
    return () => {
      active = false;
    };
  }, []);

  // Debounced async save on every change, gated until after hydration.
  useEffect(() => {
    if (lastLoadedRef.current === null) return; // not loaded yet
    if (notes === lastLoadedRef.current) return; // hydrate render, nothing new
    setStatus('saving');
    const timer = setTimeout(() => {
      persistNotes(notes).then(() => setStatus('ready'));
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [notes]);

  return { notes, dispatch, status };
};
