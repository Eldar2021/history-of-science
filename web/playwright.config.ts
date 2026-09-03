import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a production build and the local Supabase (`supabase start`).
 * `npm run e2e`. Needs web/.env.local (local demo keys) and Google Chrome (channel "chrome",
 * so nothing is downloaded); `npx playwright install chromium` and PW_BROWSER=chromium otherwise.
 */
const PORT = 3300;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    locale: "en-US",
  },
  projects: [
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: process.env.PW_BROWSER === "chromium" ? undefined : "chrome" },
    },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
