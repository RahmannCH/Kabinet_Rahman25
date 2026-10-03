import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:49173';
const webServer = process.env.BASE_URL ? undefined : {
  command: 'npm run preview',
  url: baseURL,
  reuseExistingServer: false,
  timeout: 15000,
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  outputDir: 'test-results/results',
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer,
});
