import type { RefObject } from 'react';
import type { Note } from '../../types';
import type { NotesDispatch } from '../../hooks/useNotes';

export interface StickyNoteProps {
  note: Note;
  dispatch: NotesDispatch;
  boardRef: RefObject<HTMLDivElement | null>;
  trashRef: RefObject<HTMLDivElement | null>;
}
