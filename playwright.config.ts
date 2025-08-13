import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 * Uncomment the following line to load environment variables from a .env file during testing.
 * require('dotenv').config();
 */

/**
 * See https://playwright.dev/docs/test-configuration.
 */
// This is the main configuration file for Playwright tests.
// It defines various settings for running tests across different browsers and environments.
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // Configure the base URL for your application under test.
    // baseURL: 'http://127.0.0.1:3000', // Replace with your application's local development URL

    /* Collect traces on failure. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // Project for testing in Chromium browser.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Project for testing in Firefox browser.
    {

      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Uncomment to configure projects for mobile viewports.
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    // Uncomment to configure projects for branded browsers.
    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Brave Browser',
    //   use: { ...devices['Desktop Chrome'], channel: 'brave' },
    // },

    // Uncomment to configure a project specifically for API testing.
    /* Projects for API testing */
    // {
    //   name: 'API',
    //   use: { baseURL: 'http://localhost:3000/api' },
    // },
  ],

  // Configure the web server to run before starting tests.
  /* Run your local dev server before starting the tests */
  // webServer: {
  //   Command to start your development server.
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});