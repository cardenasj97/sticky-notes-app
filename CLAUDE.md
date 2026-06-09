# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                       # Vite dev server at http://localhost:5173
npm run build                     # tsc -b (strict type-check) + vite build
npm run lint                      # eslint .
npm run test                      # vitest run (single pass)
npm run test:watch                # vitest watch mode
npx vitest run src/utils/geometry.test.ts   # run one test file
npx vitest run -t "clamps"                   # run tests matching a name
```

`npm run build` runs the type-checker, so a type error fails the build. Tests live next to their source (`*.test.ts`).

## Architecture

A from-scratch sticky-notes board — React 19 + TypeScript + Vite. No drag-and-drop, UI-component, or color-picker libraries; all gestures are built on the Pointer Events API.

**State lives in one reducer.** `notesReducer` in `src/hooks/useNotes.ts` is a pure, exported function owning every mutation (`add | move | resize | updateText | setColor | bringToFront | remove`) over a single `Note[]`. It's exported specifically so it can be unit-tested without React. `useNotes` wires it to `useReducer` with a lazy initializer (`loadNotes`) and persists on every change via one `useEffect` → `saveNotes`. Add new mutations as reducer actions, not as ad-hoc `setState` in components.

**Persistence is schema-guarded.** `src/utils/storage.ts` validates anything read from `localStorage`; corrupt/outdated data degrades to an empty board rather than crashing. The reducer hydrates through this on init.

**One gesture primitive.** `usePointerDrag` (`src/hooks/usePointerDrag.ts`) captures the pointer and tracks `pointermove`/`pointerup` on `window` (so a drag survives the cursor leaving the element) and hands callbacks live deltas. Create, move, and resize are all just different callback sets passed to it — put new pointer gestures here too, don't re-implement capture/cleanup.

**Mid-drag performance is deliberate, preserve it.** In `StickyNote.tsx`, an active gesture writes a transient `draft` rect to *local* state and commits to the global reducer exactly once, on `pointerup`. Notes are wrapped in `React.memo` so siblings don't re-render during a drag. Trash-hover feedback is applied **imperatively** (`trash.classList.toggle('trash-zone--active', ...)`) precisely to avoid re-rendering the note tree on every pointer move. Don't replace these with reducer dispatches on `pointermove` — it would re-render the whole board per frame.

**Geometry is pure and isolated** in `src/utils/geometry.ts` (`clamp`, `rectsIntersect`, `normalizeRect`, `clampRectToBounds`). Notes are clamped to stay inside the board; coordinates are board-relative, converted to client coordinates only for trash intersection tests.

**Shared types and constants** are in `src/types.ts`: `Note` (a `Rect` + `id`/`color`/`text`/`zIndex`), the fixed `NOTE_COLORS` palette, `MIN_NOTE_SIZE`, `DEFAULT_NOTE_SIZE`.

Component tree: `App` → `Toolbar` (next-note color) + `Board` (drag-to-create, renders notes + `TrashZone`) → `StickyNote` (move/resize/edit/color/trash detection).
