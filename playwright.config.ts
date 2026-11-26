import { defineConfig, devices } from "@playwright/test";

/**
 * E2E contra o build de produção servido pelo `vite preview` (porta 5181).
 * Fora do `npm run verify` de propósito: o build da Vercel não tem navegador.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:5181",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx vite preview --port 5181 --strictPort",
    url: "http://localhost:5181",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
