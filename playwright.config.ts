import { defineConfig, devices } from '@playwright/test';

/**
 * Cross-browser end-to-end tests for the sticky-notes board.
 *
 * Specs live in ./e2e (kept out of the Vitest unit suite — see vite.config.ts).
 * The dev server is started automatically before the run.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    // Mozilla Firefox — bundled engine, no extra install beyond `playwright install firefox`.
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // Microsoft Edge — uses the installed branded Edge build via the `msedge` channel.
    // Requires Edge on the machine: `npx playwright install msedge`. On environments
    // where Edge is unavailable (some CI images), run only the firefox project.
    { name: 'Microsoft Edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
  // Test the production build via `vite preview`, not the dev server: the dev
  // server's on-demand dep-optimization forces a page reload on cold start,
  // which races the first navigation and intermittently serves a blank page.
  // The built artifact is fully ready when served — deterministic across browsers.
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
