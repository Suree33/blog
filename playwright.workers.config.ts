import { defineConfig, devices } from '@playwright/test';

const workersPort = 8788;
const workersBaseURL = `http://localhost:${workersPort}/`;

/** Cloudflare Workers preview を通した content negotiation の E2E 設定。 */
export default defineConfig({
  testDir: './tests/e2e/workers',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.GITHUB_ACTIONS
    ? [['github'], ['list'], ['html']]
    : [['list'], ['html']],
  use: {
    baseURL: workersBaseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm run build:ci && pnpm run preview:workers --port ${workersPort}`,
    url: workersBaseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});
