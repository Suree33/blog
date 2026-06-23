import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for the Astro blog.
 *
 * Phase 1 scope: Chromium-only smoke tests against the Astro preview server.
 * The fixture/route foundation here is intended to be gradually expanded into
 * Page Object Models and visual regression tests in later phases.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html']],
  use: {
    baseURL: 'http://localhost:4321/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm run build:ci && pnpm run preview',
    url: 'http://localhost:4321/',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});
