import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    test: {
      env: {
        // Use real DATABASE_URL from .env if available, otherwise stub for import-time checks
        DATABASE_URL: env.DATABASE_URL ?? "postgresql://test:test@test.neon.tech/test",
      },
    },
  };
});
