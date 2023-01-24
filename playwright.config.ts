import path from 'node:path'
import { PlaywrightTestConfig, devices } from '@playwright/test'

// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  expect: {
    timeout: 10000,
  },

  // Timeout per test
  timeout: 30 * 1000,

  globalTimeout: 90 * 60 * 1000,
  // Test directory
  testDir: path.join(__dirname, 'src'),
  testMatch: /.spec.ts/,
  // If a test fails, retry it additional 1 time
  retries: process.env.CI ? 1 : 0,

  use: {
    // Retry a test if its failing with enabled tracing. This allows you to analyse the DOM, console logs, network traffic etc.
    // More information: https://playwright.dev/docs/trace-viewer
    trace: 'retry-with-trace',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ]
}

export default config
