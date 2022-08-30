// @ts-check
const { devices } = require('@playwright/test');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();


/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  testDir: './playwright',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: './test-results/',

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'cd playwright/test_project && canopy build && canopy serve -s -p 3000',
      port: 3000
    },
    {
      command: 'cp -R playwright/test_project playwright/prefix_test && cd playwright/prefix_test && canopy build --project-path-prefix test && canopy serve -s -p 3001',
      port: 3001
    },
    {
      command: 'cp -R playwright/test_project playwright/hash_urls_test && cd playwright/hash_urls_test && canopy build --hash-urls && canopy serve -s -p 3002',
      port: 3002
    },
    {
      command: 'cp -R playwright/test_project playwright/hash_urls_and_prefix_test && cd playwright/hash_urls_and_prefix_test && canopy build --hash-urls --project-path-prefix test && canopy serve -s -p 3003',
      port: 3003
    }
  ],

  globalTeardown: './playwright/global_teardown.js'
};

module.exports = config;
