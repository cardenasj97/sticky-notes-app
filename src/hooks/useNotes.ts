import { useEffect, useReducer } from 'react';
import type { Dispatch } from 'react';
import type { Note, Position, Size } from '../types';
import { loadNotes, saveNotes } from '../utils/storage';

export type NotesAction =
  | { type: 'add'; note: Omit<Note, 'id' | 'zIndex'> }
  | { type: 'move'; id: string; position: Position }
  | { type: 'resize'; id: string; rect: Position & Size }
  | { type: 'updateText'; id: string; text: string }
  | { type: 'setColor'; id: string; color: string }
  | { type: 'bringToFront'; id: string }
  | { type: 'remove'; id: string };

export type NotesDispatch = Dispatch<NotesAction>;

const nextZIndex = (notes: Note[]): number =>
  notes.reduce((max, note) => Math.max(max, note.zIndex), 0) + 1;

/** Pure reducer — exported so it can be unit-tested without React. */
export const notesReducer = (state: Note[], action: NotesAction): Note[] => {
  switch (action.type) {
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

export const useNotes = (): { notes: Note[]; dispatch: NotesDispatch } => {
  const [notes, dispatch] = useReducer(notesReducer, undefined, loadNotes);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  return { notes, dispatch };
};
