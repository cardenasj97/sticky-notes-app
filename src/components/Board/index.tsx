import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Position, Rect } from '../../types';
import { MIN_NOTE_SIZE } from '../../types';
import { usePointerDrag } from '../../hooks/usePointerDrag';
import { normalizeRect } from '../../utils/geometry';
import { StickyNote } from '../StickyNote';
import { TrashZone } from '../TrashZone';
import type { BoardProps } from './types';
import { toBoardCoords } from './utils';

export function Board({ notes, dispatch, activeColor }: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);

  // Rectangle being drawn by a create-drag; `null` when not creating.
  const [draft, setDraft] = useState<Rect | null>(null);
  const startRef = useRef<Position | null>(null);
  const draftRef = useRef<Rect | null>(null);

  const startCreate = usePointerDrag({
    onStart: ({ start }) => {
      const rect = boardRef.current?.getBoundingClientRect() ?? null;
      const origin = toBoardCoords(start.x, start.y, rect);
      startRef.current = origin;
      draftRef.current = { ...origin, width: 0, height: 0 };
      setDraft(draftRef.current);
    },
    onMove: ({ current }) => {
      if (!startRef.current) return;
      const rect = boardRef.current?.getBoundingClientRect() ?? null;
      const next = normalizeRect(startRef.current, toBoardCoords(current.x, current.y, rect));
      draftRef.current = next;
      setDraft(next);
    },
    onEnd: () => {
      const rect = draftRef.current;
      startRef.current = null;
      draftRef.current = null;
      setDraft(null);
      if (rect && rect.width >= MIN_NOTE_SIZE && rect.height >= MIN_NOTE_SIZE) {
        dispatch({ type: 'add', note: { ...rect, color: activeColor, text: '' } });
      }
    },
  });

  const handlePointerDown = (event: ReactPointerEvent) => {
    // Only the empty board starts a create-drag; clicks on notes are theirs.
    if (event.target !== boardRef.current) return;
    startCreate(event);
  };

  return (
    <div ref={boardRef} className="board" onPointerDown={handlePointerDown}>
      {notes.length === 0 && !draft && (
        <p className="board__empty">Drag anywhere to create your first note</p>
      )}

      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          dispatch={dispatch}
          boardRef={boardRef}
          trashRef={trashRef}
        />
      ))}

      {draft && (
        <div
          className="board__draft"
          style={{
            left: draft.x,
            top: draft.y,
            width: draft.width,
            height: draft.height,
            background: activeColor,
          }}
        />
      )}

      <TrashZone ref={trashRef} />
    </div>
  );
}
