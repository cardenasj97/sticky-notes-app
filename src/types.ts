export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Position, Size {}

export interface Note extends Rect {
  id: string;
  color: string;
  text: string;
  zIndex: number;
}

/** Fixed palette — no color picker dependency, keeps notes visually consistent. */
export const NOTE_COLORS = [
  '#fff9b1',
  '#ffd6a5',
  '#caffbf',
  '#9bf6ff',
  '#a0c4ff',
  '#ffadad',
] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];

/** Smallest note that can be created or resized to, in pixels. */
export const MIN_NOTE_SIZE = 80;

/** Default dimensions used as a floor when a create-drag is barely moved. */
export const DEFAULT_NOTE_SIZE = 160;
