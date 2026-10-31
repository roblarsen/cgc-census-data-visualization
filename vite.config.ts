import { defineConfig } from "vitest/config";

// Relative base by default so the build works from any GitHub Pages project
// subpath; CI may override it with BASE_PATH (e.g. "/cgc-census-data-visualization/").
export default defineConfig({
  base: process.env.BASE_PATH || "./",
  build: { outDir: "dist" },
  test: { include: ["tests/**/*.test.ts"] }
});
