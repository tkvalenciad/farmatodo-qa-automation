import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

const GLOBAL_TEST_TIMEOUT = 60_000;
const EXPECT_TIMEOUT = 10_000;
const ACTION_TIMEOUT = 15_000;
const NAVIGATION_TIMEOUT = 30_000;

export default defineConfig({
  testDir: './tests',

  timeout: GLOBAL_TEST_TIMEOUT,
  expect: { timeout: EXPECT_TIMEOUT },

  fullyParallel: true,

  forbidOnly: env.isCI,

  retries: env.isCI ? 2 : 0,

  workers: env.isCI ? 1 : undefined,

  reporter: env.isCI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    actionTimeout: ACTION_TIMEOUT,
    navigationTimeout: NAVIGATION_TIMEOUT,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'integration',
      testDir: './tests/integration',
      use: {
        baseURL: env.api.baseUrl,
      },
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: env.e2e.baseUrl,
        testIdAttribute: 'data-test',
      },
    },
  ],
});
