import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["../../tests/integration/backend/**/*.test.ts"],
    setupFiles: ["../../tests/integration/backend/setup.ts"],
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@domain": path.resolve(__dirname, "./domain"),
      "@infrastructure": path.resolve(__dirname, "./infrastructure"),
      "@application": path.resolve(__dirname, "./application"),
      "@utils": path.resolve(__dirname, "./utils"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
})
