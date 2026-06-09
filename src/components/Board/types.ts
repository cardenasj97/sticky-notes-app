import type { Note } from '../../types';
import type { NotesDispatch } from '../../hooks/useNotes';

export interface BoardProps {
  notes: Note[];
  dispatch: NotesDispatch;
  activeColor: string;
}
