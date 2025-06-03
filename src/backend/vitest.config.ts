import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "src/**/*.spec.ts",
      "src/**/*.test.ts",
      "../../tests/unit/backend/**/*.test.ts",
    ],
    setupFiles: ["../../tests/unit/backend/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/**/*.spec.ts",
        "src/**/index.ts",
        "prisma/",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@domain": path.resolve(__dirname, "./src/domain"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@application": path.resolve(__dirname, "./src/application"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
})
