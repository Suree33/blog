import { defineConfig, devices } from '@playwright/test';
const e2ePort = 4322;
const e2eBaseURL = `http://localhost:${e2ePort}/`;
const ciE2EWorkers = (() => {
  if (!process.env.CI) {
    return undefined;
  }

  const parsedWorkers = Number.parseInt(process.env.E2E_WORKERS ?? '2', 10);

  return Number.isFinite(parsedWorkers) && parsedWorkers > 1
    ? parsedWorkers
    : 2;
})();

/**
 * Astro ブログの Playwright E2E 設定。
 *
 * `astro preview` を起動し、各プロジェクトでスモークテスト、ナビゲーション、
 * テーマ切り替え、ビジュアルリグレッションを検証する。
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e/specs',
  snapshotPathTemplate:
    '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: ciE2EWorkers,
  reporter: [['list'], ['html']],
  use: {
    baseURL: e2eBaseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Desktop
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 10'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 17'] },
    },
    {
      name: 'Mobile Safari (Small screen)',
      use: { ...devices['iPhone SE (3rd gen)'] },
    },
  ],
  webServer: {
    command: `pnpm run build:ci && pnpm run preview --port ${e2ePort}`,
    url: e2eBaseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});
