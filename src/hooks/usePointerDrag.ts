import { useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Position } from '../types';

export interface DragState {
  /** Pointer position at gesture start, in client coordinates. */
  start: Position;
  /** Latest pointer position, in client coordinates. */
  current: Position;
  /** Movement since start. */
  dx: number;
  dy: number;
}

export interface PointerDragHandlers {
  onStart?: (state: DragState, event: ReactPointerEvent) => void;
  onMove?: (state: DragState) => void;
  onEnd?: (state: DragState) => void;
}

/**
 * Shared pointer-gesture primitive used by create, move and resize.
 *
 * Returns a `pointerdown` handler. It captures the pointer and tracks the
 * gesture on `window` so movement continues even when the cursor leaves the
 * element. Callbacks receive live deltas; consumers decide what to mutate.
 */
export const usePointerDrag = ({ onStart, onMove, onEnd }: PointerDragHandlers) =>
  useCallback(
    (event: ReactPointerEvent) => {
      if (event.button !== 0) return; // primary button only

      const target = event.currentTarget as HTMLElement;
      target.setPointerCapture(event.pointerId);

      const start: Position = { x: event.clientX, y: event.clientY };
      const state: DragState = { start, current: start, dx: 0, dy: 0 };
      onStart?.(state, event);

      const handleMove = (e: globalThis.PointerEvent) => {
        state.current = { x: e.clientX, y: e.clientY };
        state.dx = e.clientX - start.x;
        state.dy = e.clientY - start.y;
        onMove?.(state);
      };

      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        onEnd?.(state);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [onStart, onMove, onEnd],
  );
