import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/api",

  fullyParallel: true,

  reporter: "html",

  use: {
    baseURL: process.env.API_URL,

    extraHTTPHeaders: {
      Accept: "application/json",
    },
  },
});
