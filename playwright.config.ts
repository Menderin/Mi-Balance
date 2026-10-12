import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./apps/web/tests",
  workers: 1,
  use: { baseURL: "http://localhost:5173", browserName: "chromium" },
  webServer: {
    command:
      "npm run dev --workspace @mi-balance/web -- --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
