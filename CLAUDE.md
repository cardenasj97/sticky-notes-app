# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                       # Vite dev server at http://localhost:5173
npm run build                     # tsc -b (strict type-check) + vite build
npm run lint                      # eslint .
npm run test                      # vitest run (single pass)
npm run test:watch                # vitest watch mode
npm run test:e2e                  # playwright run (cross-browser e2e: Firefox + Edge)
npm run test:e2e:ui               # playwright in UI mode
npx vitest run src/utils/geometry.test.ts   # run one test file
npx vitest run -t "clamps"                   # run tests matching a name
```

`npm run build` runs the type-checker, so a type error fails the build. Tests live next to their source (`*.test.ts`).

## Commits

Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) spec:

    <type>(<optional scope>): <description>

Use one of these types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`,
`test`, `build`, `ci`, `chore`, `revert`. Keep the description in the imperative
mood and lowercase. Example: `feat(board): add drag-to-create gesture`.

## Architecture

A from-scratch sticky-notes board — React 19 + TypeScript + Vite. No drag-and-drop, UI-component, or color-picker libraries; all gestures are built on the Pointer Events API.

**State lives in one reducer.** `notesReducer` in `src/hooks/useNotes.ts` is a pure, exported function owning every mutation (`hydrate | add | move | resize | updateText | setColor | bringToFront | remove`) over a single `Note[]`. It's exported specifically so it can be unit-tested without React. `useNotes` wires it to `useReducer` starting empty, then loads asynchronously on mount via `fetchNotes` (dispatching `hydrate`) and saves on every change through a **debounced** `persistNotes` effect. It exposes a `status` (`loading | saving | ready`) for UI feedback, and a ref-equality gate (`lastLoadedRef`) skips the redundant save the hydrate render would otherwise trigger. Add new mutations as reducer actions, not as ad-hoc `setState` in components.

**Persistence is an async mock REST layer over schema-guarded storage.** Persistence goes through `src/api/notesApi.ts` (`fetchNotes`/`persistNotes`, Promises with artificial latency, mimicking a `fetch`-backed API), which is backed by `src/utils/storage.ts`. The storage layer validates anything read from `localStorage`; corrupt/outdated data degrades to an empty board rather than crashing. The reducer hydrates via the async `fetchNotes` → `hydrate`, not a synchronous init.

**One gesture primitive.** `usePointerDrag` (`src/hooks/usePointerDrag.ts`) captures the pointer and tracks `pointermove`/`pointerup` on `window` (so a drag survives the cursor leaving the element) and hands callbacks live deltas. Create, move, and resize are all just different callback sets passed to it — put new pointer gestures here too, don't re-implement capture/cleanup.

**Mid-drag performance is deliberate, preserve it.** In `components/StickyNote/index.tsx`, an active gesture writes a transient `draft` rect to *local* state and commits to the global reducer exactly once, on `pointerup`. Notes are wrapped in `React.memo` so siblings don't re-render during a drag. Trash-hover feedback is applied **imperatively** (`trash.classList.toggle('trash-zone--active', ...)`) precisely to avoid re-rendering the note tree on every pointer move. Don't replace these with reducer dispatches on `pointermove` — it would re-render the whole board per frame.

**Geometry is pure and isolated** in `src/utils/geometry.ts` (`clamp`, `isPointInRect`, `rectsIntersect`, `normalizeRect`, `clampRectToBounds`). Component-specific coordinate helpers are co-located with their component: `toBoardCoords` in `components/Board/utils.ts`, `isOverTrash`/`domRectToRect` in `components/StickyNote/utils.ts`. Notes are clamped to stay inside the board; coordinates are board-relative, converted to client coordinates only for trash intersection tests.

**Shared types and constants** are in `src/types.ts`: `Note` (a `Rect` + `id`/`color`/`text`/`zIndex`), the fixed `NOTE_COLORS` palette, `MIN_NOTE_SIZE`, `DEFAULT_NOTE_SIZE`.

**Components are co-located.** Each lives in its own folder under `src/components/` — `index.tsx` plus a `types.ts`, an optional `utils.ts`, and co-located tests (`*.test.tsx` / `utils.test.ts`). Component tree: `App` → `Toolbar/` (next-note color) + `Board/` (drag-to-create, renders notes + `TrashZone/`) → `StickyNote/` (move/resize/edit/color/trash detection).
