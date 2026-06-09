import { describe, it, expect } from 'vitest';
import { domRectToRect, isOverTrash } from './utils';

const domRect = (
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRect =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
  } as DOMRect);

describe('domRectToRect', () => {
  it('maps left/top to x/y and keeps width/height', () => {
    expect(domRectToRect(domRect(10, 20, 30, 40))).toEqual({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    });
  });
});

describe('isOverTrash', () => {
  const board = domRect(0, 0, 800, 600);
  const trash = domRect(200, 200, 100, 100); // client region 200–300 on both axes

  it('is true when the note overlaps the trash zone', () => {
    expect(isOverTrash({ x: 250, y: 250, width: 60, height: 60 }, board, trash)).toBe(true);
  });

  it('is false when the note is clear of the trash zone', () => {
    expect(isOverTrash({ x: 0, y: 0, width: 50, height: 50 }, board, trash)).toBe(false);
  });

  it('translates board-relative coords through the board offset', () => {
    const offsetBoard = domRect(100, 100, 800, 600);
    // Board-relative (150,150) => client (250,250), which overlaps the trash.
    expect(
      isOverTrash({ x: 150, y: 150, width: 60, height: 60 }, offsetBoard, trash),
    ).toBe(true);
  });
});
