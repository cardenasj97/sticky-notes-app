# Sticky Notes

A single-page sticky-notes board built with **React 19 + TypeScript** and **Vite**.
All interactions (create, move, resize, delete) are implemented from scratch with
the Pointer Events API — no drag-and-drop or UI component libraries are used.

## Features

**Core**

- **Create** — drag on an empty area of the board to draw a note at the position
  and size you want (drags below the minimum size are ignored).
- **Move** — drag a note anywhere; it is clamped to stay inside the board.
- **Resize** — drag the bottom-right corner handle.
- **Delete** — drag a note over the trash zone (bottom-right); it highlights while
  a note hovers it and removes the note on drop.

**Bonus**

- Inline text editing (double-click a note).
- Per-note colors (palette on the note, shown on hover) and a toolbar palette that
  sets the color of the next note created.
- Bring-to-front on interaction (z-index stacking for overlapping notes).
- Persistence through an **async mock REST API** (`localStorage`-backed), with a
  live load/save status indicator; notes are restored on page load.

## Architecture

State is a single `Note[]` owned by a `useReducer` inside the `useNotes` hook. The
reducer is a pure, exported function (`notesReducer`) covering every mutation —
`hydrate | add | move | resize | updateText | setColor | bringToFront | remove` —
which keeps the data layer fully unit-testable in isolation from React.
Persistence goes through an async mock REST client (`src/api/notesApi.ts`):
`fetchNotes`/`persistNotes` return Promises with realistic latency, backed by a
thin, schema-guarded `localStorage` store so data survives reloads and corrupt or
outdated data degrades gracefully to an empty board. `useNotes` loads
asynchronously on mount (dispatching `hydrate`) and saves on change via a debounced
effect; a reference-equality gate skips the redundant save the hydrate render would
otherwise trigger, so loading never writes the initial empty array back over stored
notes. A `status` value (`loading | saving | ready`) drives the header indicator.

All gestures share one primitive, `usePointerDrag`, which captures the pointer and
tracks `pointermove`/`pointerup` on `window` so a drag continues even when the cursor
leaves the element. Create, move, and resize are just different sets of callbacks
passed to that hook, so the hard part (pointer capture, deltas, cleanup) exists in
exactly one place. Geometry is isolated in small pure helpers (`clamp`,
`rectsIntersect`, `normalizeRect`, `clampRectToBounds`).

Performance was a primary concern. During an active gesture only the dragged note
re-renders: it holds a transient `draft` rect in local state and commits to the
global reducer **once**, on `pointerup`. Every `StickyNote` is wrapped in
`React.memo`, so the other notes never re-render mid-drag. Trash-hover feedback is
applied imperatively (a CSS class toggled on the trash element) precisely to avoid
re-rendering the note tree on every pointer move. The result stays smooth at 60fps
regardless of how many notes are on the board.

## Project structure

```
src/
  types.ts                 Shared types + constants (Note, palette, sizes)
  api/
    notesApi.ts            Async mock REST client (fetch/persist)
  hooks/
    useNotes.ts            Reducer + async load/save orchestration + status
    usePointerDrag.ts      Shared pointer-gesture primitive
  utils/
    geometry.ts            Pure rect/point math
    storage.ts             Schema-guarded localStorage store (used by the API)
  components/
    Board.tsx              Canvas: drag-to-create, renders notes + trash
    StickyNote.tsx         Move / resize / edit / color / trash detection
    Toolbar.tsx            New-note color palette + usage hint
    TrashZone.tsx          Drop target
```

## Build & run

Requires Node 18+.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check (strict) + production build
npm run preview  # preview the production build
npm run test     # run unit tests (Vitest)
```

## Browser support / target

Designed for **desktop**, minimum resolution **1024×768**. Verified against latest
Chrome, Firefox, and Edge. The Pointer Events API and `localStorage` are supported
by all target browsers.
