import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Cross-browser interaction tests for the sticky-notes board (Firefox + Edge).
 *
 * Every core gesture is built on the Pointer Events API and tracked on `window`
 * (see usePointerDrag.ts). Playwright's `page.mouse.*` dispatches real pointer
 * events, so we drive create / move / resize / delete with mouse down→move→up.
 * `steps` is set on each move so the drag registers as continuous motion.
 */

/** Drag the cursor from one viewport point to another as a continuous gesture. */
async function drag(page: Page, from: { x: number; y: number }, to: { x: number; y: number }) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
}

/** Center point of a locator in viewport coordinates. */
async function center(locator: Locator): Promise<{ x: number; y: number }> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('element has no bounding box');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/**
 * Navigate and wait for the async mock-API load to settle before interacting.
 * Each test runs in a fresh Playwright context, so localStorage starts empty —
 * no manual clearing needed (and clearing here would wipe the reload test).
 */
async function gotoReadyBoard(page: Page) {
  await page.goto('/');
  await expect(page.locator('.app__title')).toHaveText('Sticky Notes');
  // Saves are gated until the initial load resolves; wait for "ready" so a note
  // we create isn't clobbered by the hydrate render.
  await expect(page.locator('.app__status--ready')).toBeVisible();
}

/** Create one note by drag-to-create on an empty area of the board. */
async function createNote(page: Page): Promise<Locator> {
  const board = page.locator('.board');
  const box = await board.boundingBox();
  if (!box) throw new Error('board has no bounding box');
  const origin = { x: box.x + 120, y: box.y + 100 };
  // Well above MIN_NOTE_SIZE (80px) in both dimensions.
  await drag(page, origin, { x: origin.x + 220, y: origin.y + 170 });
  const note = page.locator('.note').first();
  await expect(note).toBeVisible();
  return note;
}

test('loads with the empty-board prompt', async ({ page }) => {
  await gotoReadyBoard(page);
  await expect(page.locator('.board__empty')).toBeVisible();
  await expect(page.locator('.note')).toHaveCount(0);
});

test('drag-to-create adds a note and hides the empty prompt', async ({ page }) => {
  await gotoReadyBoard(page);
  await createNote(page);
  await expect(page.locator('.note')).toHaveCount(1);
  await expect(page.locator('.board__empty')).toHaveCount(0);
});

test('double-click edits a note and commits the text', async ({ page }) => {
  await gotoReadyBoard(page);
  const note = await createNote(page);

  await note.dblclick();
  const editor = note.locator('.note__editor');
  await expect(editor).toBeVisible();
  await editor.fill('hello cross-browser');
  // Commit on blur.
  await page.locator('.app__header').click();

  await expect(note.locator('.note__text')).toContainText('hello cross-browser');
});

test('a per-note swatch changes the note color', async ({ page }) => {
  await gotoReadyBoard(page);
  const note = await createNote(page);

  // Notes are created with the default color (#fff9b1).
  await expect.poll(() => note.evaluate((el) => el.style.background)).toContain('rgb(255, 249, 177)');

  // Palette is opacity:0 until hover; hover so the click target is interactable.
  await note.hover();
  await note.locator('button[aria-label="Set color #ffadad"]').click();

  await expect.poll(() => note.evaluate((el) => el.style.background)).toContain('rgb(255, 173, 173)');
});

test('dragging a note moves it to a new position', async ({ page }) => {
  await gotoReadyBoard(page);
  const note = await createNote(page);

  const before = await note.boundingBox();
  if (!before) throw new Error('no box');
  // Grab the text body (avoids the top palette and the corner resize handle).
  const grab = { x: before.x + before.width / 2, y: before.y + before.height / 2 };
  await drag(page, grab, { x: grab.x + 90, y: grab.y + 60 });

  await expect
    .poll(async () => (await note.boundingBox())?.x ?? 0)
    .toBeGreaterThan(before.x + 50);
});

test('dragging the corner handle resizes a note', async ({ page }) => {
  await gotoReadyBoard(page);
  const note = await createNote(page);

  const before = await note.boundingBox();
  if (!before) throw new Error('no box');
  const handle = note.locator('[aria-label="Resize note"]');
  await note.hover();
  const from = await center(handle);
  await drag(page, from, { x: from.x + 80, y: from.y + 60 });

  await expect
    .poll(async () => (await note.boundingBox())?.width ?? 0)
    .toBeGreaterThan(before.width + 40);
});

test('dropping a note on the trash zone deletes it', async ({ page }) => {
  await gotoReadyBoard(page);
  const note = await createNote(page);
  await expect(page.locator('.note')).toHaveCount(1);

  const noteBox = await note.boundingBox();
  const trashBox = await page.locator('[aria-label="Trash zone"]').boundingBox();
  if (!noteBox || !trashBox) throw new Error('no box');

  const grab = { x: noteBox.x + noteBox.width / 2, y: noteBox.y + noteBox.height / 2 };
  // Deletion is decided by rect intersection (trash-zone is pointer-events:none),
  // so just drag the note so it overlaps the trash zone's center.
  const target = { x: trashBox.x + trashBox.width / 2, y: trashBox.y + trashBox.height / 2 };
  await drag(page, grab, target);

  await expect(page.locator('.note')).toHaveCount(0);
  await expect(page.locator('.board__empty')).toBeVisible();
});

test('a created note persists across a reload', async ({ page }) => {
  await gotoReadyBoard(page);
  const note = await createNote(page);
  await note.dblclick();
  await note.locator('.note__editor').fill('survives reload');
  await page.locator('.app__header').click();
  await expect(note.locator('.note__text')).toContainText('survives reload');

  // Wait for the debounced save to flush to localStorage before reloading.
  await expect(page.locator('.app__status--ready')).toBeVisible();

  await page.reload();
  await expect(page.locator('.app__status--ready')).toBeVisible();
  await expect(page.locator('.note')).toHaveCount(1);
  await expect(page.locator('.note__text')).toContainText('survives reload');
});
