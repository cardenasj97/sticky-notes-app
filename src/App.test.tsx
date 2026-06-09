import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { Note } from './types';
import { NOTE_COLORS } from './types';

// Mock the (mock) API so tests don't pay the artificial latency and don't touch
// real localStorage. `useNotes` imports these same functions.
vi.mock('./api/notesApi', () => ({
  fetchNotes: vi.fn(),
  persistNotes: vi.fn(),
}));

import { fetchNotes, persistNotes } from './api/notesApi';

const mockFetch = vi.mocked(fetchNotes);
const mockPersist = vi.mocked(persistNotes);

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'n1',
  x: 40,
  y: 40,
  width: 160,
  height: 160,
  color: NOTE_COLORS[0],
  text: '',
  zIndex: 1,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockResolvedValue([]);
  mockPersist.mockResolvedValue(undefined);
});

describe('App — critical flows', () => {
  it('shows the empty-board prompt when there are no notes', async () => {
    render(<App />);
    expect(
      await screen.findByText('Drag anywhere to create your first note'),
    ).toBeInTheDocument();
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
  });

  it('hydrates and renders notes loaded from the API', async () => {
    mockFetch.mockResolvedValue([makeNote({ text: 'Loaded note' })]);
    render(<App />);
    expect(await screen.findByText('Loaded note')).toBeInTheDocument();
  });

  it('does not persist on the initial hydrate render', async () => {
    mockFetch.mockResolvedValue([makeNote({ text: 'Loaded note' })]);
    render(<App />);
    await screen.findByText('Loaded note');
    // Wait past the debounce window to be sure no save was scheduled.
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(mockPersist).not.toHaveBeenCalled();
  });

  it('persists an edited note after the debounce', async () => {
    mockFetch.mockResolvedValue([makeNote({ text: 'old' })]);
    const user = userEvent.setup();
    render(<App />);

    await user.dblClick(await screen.findByText('old'));
    const textbox = screen.getByRole('textbox');
    await user.clear(textbox);
    await user.type(textbox, 'new text');
    await user.tab(); // blur commits the edit

    await waitFor(() =>
      expect(mockPersist).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'n1', text: 'new text' }),
      ]),
    );
  });

  it('persists a color change made from a note swatch', async () => {
    mockFetch.mockResolvedValue([makeNote({ color: NOTE_COLORS[0] })]);
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('All changes saved');
    await user.click(screen.getByLabelText(`Set color ${NOTE_COLORS[5]}`));

    await waitFor(() =>
      expect(mockPersist).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'n1', color: NOTE_COLORS[5] }),
      ]),
    );
  });

  it('returns the status to "All changes saved" after a change is persisted', async () => {
    mockFetch.mockResolvedValue([makeNote({ color: NOTE_COLORS[0] })]);
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('All changes saved');
    await user.click(screen.getByLabelText(`Set color ${NOTE_COLORS[5]}`));

    // After saving completes the status settles back to ready.
    await waitFor(() => expect(mockPersist).toHaveBeenCalled());
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
  });
});
