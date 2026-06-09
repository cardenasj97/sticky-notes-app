import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StickyNote } from './index';
import type { Note } from '../../types';
import { NOTE_COLORS } from '../../types';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'n1',
  x: 0,
  y: 0,
  width: 160,
  height: 160,
  color: NOTE_COLORS[0],
  text: '',
  zIndex: 1,
  ...overrides,
});

const renderNote = (note: Note) => {
  const dispatch = vi.fn();
  render(
    <StickyNote
      note={note}
      dispatch={dispatch}
      boardRef={createRef<HTMLDivElement>()}
      trashRef={createRef<HTMLDivElement>()}
    />,
  );
  return { dispatch };
};

describe('StickyNote', () => {
  it('shows the placeholder only when the note has no text', () => {
    const { unmount } = render(
      <StickyNote
        note={makeNote({ text: '' })}
        dispatch={vi.fn()}
        boardRef={createRef<HTMLDivElement>()}
        trashRef={createRef<HTMLDivElement>()}
      />,
    );
    expect(screen.getByText('Double-click to edit')).toBeInTheDocument();
    unmount();

    renderNote(makeNote({ text: 'Buy milk' }));
    expect(screen.queryByText('Double-click to edit')).not.toBeInTheDocument();
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  it('reveals an editable textarea on double-click', async () => {
    const user = userEvent.setup();
    renderNote(makeNote({ text: 'Hello' }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await user.dblClick(screen.getByText('Hello'));

    expect(screen.getByRole('textbox')).toHaveValue('Hello');
  });

  it('dispatches updateText when editing is committed on blur', async () => {
    const user = userEvent.setup();
    const { dispatch } = renderNote(makeNote({ text: '' }));

    await user.dblClick(screen.getByText('Double-click to edit'));
    await user.type(screen.getByRole('textbox'), 'Groceries');
    await user.tab(); // blur the textarea

    expect(dispatch).toHaveBeenCalledWith({
      type: 'updateText',
      id: 'n1',
      text: 'Groceries',
    });
  });

  it('commits the text when Escape is pressed', async () => {
    const user = userEvent.setup();
    const { dispatch } = renderNote(makeNote({ text: '' }));

    await user.dblClick(screen.getByText('Double-click to edit'));
    await user.type(screen.getByRole('textbox'), 'Done{Escape}');

    expect(dispatch).toHaveBeenCalledWith({
      type: 'updateText',
      id: 'n1',
      text: 'Done',
    });
  });

  it('dispatches setColor when a palette swatch is clicked', async () => {
    const user = userEvent.setup();
    const { dispatch } = renderNote(makeNote());

    await user.click(screen.getByLabelText(`Set color ${NOTE_COLORS[4]}`));

    expect(dispatch).toHaveBeenCalledWith({
      type: 'setColor',
      id: 'n1',
      color: NOTE_COLORS[4],
    });
  });
});
