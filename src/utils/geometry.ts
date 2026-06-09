import type { Position, Rect, Size } from '../types';

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const isPointInRect = (point: Position, rect: Rect): boolean =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.width &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.height;

/** Axis-aligned bounding-box overlap test (touching edges do not count). */
export const rectsIntersect = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

/** Build a rect from two corner points, always with positive width/height. */
export const normalizeRect = (start: Position, end: Position): Rect => ({
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
  width: Math.abs(end.x - start.x),
  height: Math.abs(end.y - start.y),
});

/** Keep a rect fully inside `bounds`, preserving its width and height. */
export const clampRectToBounds = (rect: Rect, bounds: Size): Rect => ({
  ...rect,
  x: clamp(rect.x, 0, Math.max(0, bounds.width - rect.width)),
  y: clamp(rect.y, 0, Math.max(0, bounds.height - rect.height)),
});
