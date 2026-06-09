import { memo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Rect } from '../../types';
import { MIN_NOTE_SIZE, NOTE_COLORS } from '../../types';
import { usePointerDrag } from '../../hooks/usePointerDrag';
import { clamp, clampRectToBounds } from '../../utils/geometry';
import type { StickyNoteProps } from './types';
import { isOverTrash } from './utils';

function StickyNoteComponent({ note, dispatch, boardRef, trashRef }: StickyNoteProps) {
  // Transient rect applied only to this note during an active gesture.
  // `null` => render from committed `note` props.
  const [draft, setDraft] = useState<Rect | null>(null);
  const [editing, setEditing] = useState(false);

  // Mutable gesture scratch space — refs avoid stale closures and re-renders.
  const baseRef = useRef<Rect>(note);
  const liveRef = useRef<Rect>(note);
  const boardRectRef = useRef<DOMRect | null>(null);
  const trashRectRef = useRef<DOMRect | null>(null);
  const overTrashRef = useRef(false);
  const movedRef = useRef(false);

  const cacheRects = () => {
    boardRectRef.current = boardRef.current?.getBoundingClientRect() ?? null;
    trashRectRef.current = trashRef.current?.getBoundingClientRect() ?? null;
  };

  const updateTrashHighlight = (rect: Rect) => {
    const board = boardRectRef.current;
    const trash = trashRef.current;
    const trashRect = trashRectRef.current;
    if (!board || !trash || !trashRect) return;
    const over = isOverTrash(rect, board, trashRect);
    overTrashRef.current = over;
    trash.classList.toggle('trash-zone--active', over);
  };

  const startMove = usePointerDrag({
    onStart: () => {
      dispatch({ type: 'bringToFront', id: note.id });
      cacheRects();
      baseRef.current = { x: note.x, y: note.y, width: note.width, height: note.height };
      liveRef.current = baseRef.current;
      movedRef.current = false;
      setDraft(baseRef.current);
    },
    onMove: ({ dx, dy }) => {
      const base = baseRef.current;
      const board = boardRectRef.current;
      const bounds = { width: board?.width ?? Infinity, height: board?.height ?? Infinity };
      const next = clampRectToBounds({ ...base, x: base.x + dx, y: base.y + dy }, bounds);
      liveRef.current = next;
      movedRef.current = dx !== 0 || dy !== 0;
      setDraft(next);
      updateTrashHighlight(next);
    },
    onEnd: () => {
      trashRef.current?.classList.remove('trash-zone--active');
      const final = liveRef.current;
      if (overTrashRef.current) {
        dispatch({ type: 'remove', id: note.id });
      } else if (movedRef.current) {
        dispatch({ type: 'move', id: note.id, position: { x: final.x, y: final.y } });
      }
      overTrashRef.current = false;
      setDraft(null);
    },
  });

  const startResize = usePointerDrag({
    onStart: () => {
      cacheRects();
      baseRef.current = { x: note.x, y: note.y, width: note.width, height: note.height };
      liveRef.current = baseRef.current;
      setDraft(baseRef.current);
    },
    onMove: ({ dx, dy }) => {
      const base = baseRef.current;
      const board = boardRectRef.current;
      const maxWidth = board ? board.width - base.x : Infinity;
      const maxHeight = board ? board.height - base.y : Infinity;
      const next: Rect = {
        ...base,
        width: clamp(base.width + dx, MIN_NOTE_SIZE, maxWidth),
        height: clamp(base.height + dy, MIN_NOTE_SIZE, maxHeight),
      };
      liveRef.current = next;
      setDraft(next);
    },
    onEnd: () => {
      const final = liveRef.current;
      dispatch({ type: 'resize', id: note.id, rect: final });
      setDraft(null);
    },
  });

  const handleResizePointerDown = (event: ReactPointerEvent) => {
    event.stopPropagation(); // don't let the move gesture also start
    startResize(event);
  };

  const commitText = (text: string) => {
    setEditing(false);
    if (text !== note.text) dispatch({ type: 'updateText', id: note.id, text });
  };

  const rect = draft ?? note;

  return (
    <div
      className={'note' + (draft ? ' note--dragging' : '')}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        zIndex: note.zIndex,
        background: note.color,
      }}
      onPointerDown={startMove}
      onDoubleClick={() => setEditing(true)}
    >
      <div className="note__palette" onPointerDown={(e) => e.stopPropagation()}>
        {NOTE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className="note__swatch"
            style={{ background: color }}
            aria-label={`Set color ${color}`}
            onClick={() => dispatch({ type: 'setColor', id: note.id, color })}
          />
        ))}
      </div>

      {editing ? (
        <textarea
          className="note__editor"
          autoFocus
          defaultValue={note.text}
          onPointerDown={(e) => e.stopPropagation()}
          onBlur={(e) => commitText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') commitText(e.currentTarget.value);
          }}
        />
      ) : (
        <div className="note__text">
          {note.text || <span className="note__placeholder">Double-click to edit</span>}
        </div>
      )}

      <div
        className="note__resize"
        onPointerDown={handleResizePointerDown}
        aria-label="Resize note"
      />
    </div>
  );
}

export const StickyNote = memo(StickyNoteComponent);
