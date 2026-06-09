import type { Rect } from '../../types';
import { rectsIntersect } from '../../utils/geometry';

/** Convert a DOMRect into the app's plain `Rect` shape. */
export const domRectToRect = (r: DOMRect): Rect => ({
  x: r.left,
  y: r.top,
  width: r.width,
  height: r.height,
});

/**
 * Whether a note currently overlaps the trash zone — the delete-detection test.
 *
 * Pure: `noteRect` is board-relative, so the caller passes the board's bounding
 * rect to translate it back into client space before comparing with the trash.
 */
export const isOverTrash = (
  noteRect: Rect,
  boardRect: DOMRect,
  trashRect: DOMRect,
): boolean => {
  const clientRect: Rect = {
    x: boardRect.left + noteRect.x,
    y: boardRect.top + noteRect.y,
    width: noteRect.width,
    height: noteRect.height,
  };
  return rectsIntersect(clientRect, domRectToRect(trashRect));
};
