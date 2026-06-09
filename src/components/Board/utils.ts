import type { Position } from '../../types';

/**
 * Convert a client (viewport) point into board-relative coordinates.
 *
 * Pure: the caller passes the board's current bounding rect (or `null` if the
 * board ref isn't mounted yet), so this can be unit-tested without the DOM.
 */
export const toBoardCoords = (
  clientX: number,
  clientY: number,
  boardRect: DOMRect | null,
): Position => ({
  x: clientX - (boardRect?.left ?? 0),
  y: clientY - (boardRect?.top ?? 0),
});
