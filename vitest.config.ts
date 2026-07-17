import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Config minima para pruebas de logica pura (scoring.ts, badges.ts) --
 * Fase 1.5 del roadmap tecnico. No usa jsdom porque estas pruebas no
 * tocan React ni el DOM, solo funciones deterministicas de src/lib.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
  },
});
