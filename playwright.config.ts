import { defineConfig, devices } from '@playwright/test';

/**
 * Astro ブログの Playwright E2E 設定。
 *
 * フェーズ1のスコープ: Astro preview サーバーに対する Chromium のみのスモークテスト。
 * ここで用意した fixture/route の基盤は、後続のフェーズで順次
 * ページオブジェクトモデル（POM）やビジュアルリグレッションテストへ拡張することを想定している。
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
