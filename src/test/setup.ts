// Registers jest-dom matchers (toBeInTheDocument, toHaveStyle, …) for Vitest.
// Wired into vitest via `test.setupFiles` in vite.config.ts.
import '@testing-library/jest-dom/vitest';

// jsdom does not implement the Pointer Capture API. Notes call
// setPointerCapture in their pointerdown handler, so any click/double-click
// that bubbles there would throw. Stub it so ordinary RTL interactions work.
// (This is not a drag simulator — gesture math is covered by the pure utils.)
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.hasPointerCapture = () => false;
}
