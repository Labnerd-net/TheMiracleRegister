import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Replaces src/db's createDb with the per-file PGlite database for every test file.
    setupFiles: ["./tests/setup.ts"],
    // Creating the in-process test database runs every migration.
    hookTimeout: 30_000,
    env: {
      // Tests use an in-process PGlite database (tests/helpers/testDb.ts). This URL is
      // deliberately unreachable so any code path that bypasses the mock fails fast
      // instead of touching a real database.
      DATABASE_URL: "postgresql://test:test@invalid.invalid/test",
    },
  },
});
