import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/__tests__/*.{test,spec}.{ts,tsx}", "src/**/__tests__/*.{test,spec}.ts"],
    setupFiles: ["./vitest.setup.ts", "./vitest.d.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/__tests__/**",
        "**/*.d.ts",
        "src/app/**/page.tsx", // Next.js pages often require jsdom complexity
        "src/app/**/layout.tsx",
        "src/types/**", // Type definition files
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
