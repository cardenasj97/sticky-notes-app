import { describe, it, expect } from 'vitest';
import {
  clamp,
  clampRectToBounds,
  isPointInRect,
  normalizeRect,
  rectsIntersect,
} from './geometry';

describe('clamp', () => {
  it('keeps a value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe('isPointInRect', () => {
  const rect = { x: 10, y: 10, width: 100, height: 50 };
  it('detects points inside and on the edges', () => {
    expect(isPointInRect({ x: 50, y: 30 }, rect)).toBe(true);
    expect(isPointInRect({ x: 10, y: 10 }, rect)).toBe(true);
  });
  it('rejects points outside', () => {
    expect(isPointInRect({ x: 0, y: 0 }, rect)).toBe(false);
    expect(isPointInRect({ x: 200, y: 30 }, rect)).toBe(false);
  });
});

describe('rectsIntersect', () => {
  const base = { x: 0, y: 0, width: 100, height: 100 };
  it('detects overlap', () => {
    expect(rectsIntersect(base, { x: 50, y: 50, width: 100, height: 100 })).toBe(true);
  });
  it('returns false when fully apart', () => {
    expect(rectsIntersect(base, { x: 200, y: 200, width: 10, height: 10 })).toBe(false);
  });
  it('treats merely touching edges as non-overlapping', () => {
    expect(rectsIntersect(base, { x: 100, y: 0, width: 10, height: 10 })).toBe(false);
  });
});

describe('normalizeRect', () => {
  it('produces positive width/height regardless of drag direction', () => {
    expect(normalizeRect({ x: 100, y: 80 }, { x: 20, y: 10 })).toEqual({
      x: 20,
      y: 10,
      width: 80,
      height: 70,
    });
  });
});

describe('clampRectToBounds', () => {
  it('pulls a rect back inside the bounds', () => {
    const rect = { x: 950, y: -20, width: 100, height: 100 };
    expect(clampRectToBounds(rect, { width: 1000, height: 800 })).toEqual({
      x: 900,
      y: 0,
      width: 100,
      height: 100,
    });
  });
});
