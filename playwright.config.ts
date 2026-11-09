import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './output/playwright/results',
  reporter: [['list'], ['html', { outputFolder: './output/playwright/report', open: 'never' }]],
  fullyParallel: false,
  workers: process.env.CI ? 1 : 2,
  timeout: process.env.CI ? 120_000 : 30_000,
  expect: { timeout: process.env.CI ? 10_000 : 5_000 },
  globalTimeout: process.env.CI ? 25 * 60_000 : 0,
  retries: 0,
  use: {
    browserName: 'chromium',
    trace: { mode: 'retain-on-failure', screenshots: false, snapshots: true },
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});
