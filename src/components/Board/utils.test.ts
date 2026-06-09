import { describe, it, expect } from 'vitest';
import { toBoardCoords } from './utils';

const domRect = (left: number, top: number): DOMRect =>
  ({ left, top, right: 0, bottom: 0, width: 0, height: 0, x: left, y: top } as DOMRect);

describe('toBoardCoords', () => {
  it('subtracts the board origin from the client point', () => {
    expect(toBoardCoords(150, 80, domRect(100, 50))).toEqual({ x: 50, y: 30 });
  });

  it('returns the client point unchanged when the board rect is null', () => {
    expect(toBoardCoords(150, 80, null)).toEqual({ x: 150, y: 80 });
  });
});
