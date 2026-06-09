/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pin the preview port so Playwright's webServer target is deterministic.
  preview: {
    port: 4173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Keep Vitest to the unit suite; Playwright owns the e2e/*.spec.ts files.
    // `.tsx` is included so React component/integration tests are picked up.
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
