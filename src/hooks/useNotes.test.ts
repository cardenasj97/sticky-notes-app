import { describe, it, expect } from 'vitest';
import { notesReducer } from './useNotes';
import type { Note } from '../types';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'a',
  x: 0,
  y: 0,
  width: 160,
  height: 160,
  color: '#fff9b1',
  text: '',
  zIndex: 1,
  ...overrides,
});

describe('notesReducer', () => {
  it('adds a note with a generated id and the next z-index', () => {
    const state = notesReducer([], {
      type: 'add',
      note: { x: 10, y: 20, width: 100, height: 100, color: '#a0c4ff', text: '' },
    });
    expect(state).toHaveLength(1);
    expect(state[0].id).toBeTruthy();
    expect(state[0].zIndex).toBe(1);
  });

  it('stacks z-index above the current maximum', () => {
    const state = notesReducer([makeNote({ zIndex: 7 })], {
      type: 'add',
      note: { x: 0, y: 0, width: 80, height: 80, color: '#caffbf', text: '' },
    });
    expect(state[1].zIndex).toBe(8);
  });

  it('moves only the targeted note', () => {
    const initial = [makeNote({ id: 'a' }), makeNote({ id: 'b', x: 5, y: 5 })];
    const state = notesReducer(initial, {
      type: 'move',
      id: 'b',
      position: { x: 300, y: 400 },
    });
    expect(state[0]).toBe(initial[0]); // untouched note keeps identity
    expect(state[1]).toMatchObject({ id: 'b', x: 300, y: 400 });
  });

  it('resizes a note', () => {
    const state = notesReducer([makeNote()], {
      type: 'resize',
      id: 'a',
      rect: { x: 0, y: 0, width: 250, height: 120 },
    });
    expect(state[0]).toMatchObject({ width: 250, height: 120 });
  });

  it('updates text and color', () => {
    const withText = notesReducer([makeNote()], {
      type: 'updateText',
      id: 'a',
      text: 'hello',
    });
    expect(withText[0].text).toBe('hello');
    const withColor = notesReducer(withText, { type: 'setColor', id: 'a', color: '#ffadad' });
    expect(withColor[0].color).toBe('#ffadad');
  });

  it('brings a note to the front', () => {
    const initial = [makeNote({ id: 'a', zIndex: 1 }), makeNote({ id: 'b', zIndex: 2 })];
    const state = notesReducer(initial, { type: 'bringToFront', id: 'a' });
    expect(state[0].zIndex).toBe(3);
  });

  it('removes a note', () => {
    const initial = [makeNote({ id: 'a' }), makeNote({ id: 'b' })];
    const state = notesReducer(initial, { type: 'remove', id: 'a' });
    expect(state).toHaveLength(1);
    expect(state[0].id).toBe('b');
  });
});
