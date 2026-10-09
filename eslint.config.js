import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist/", ".astro/", ".wrangler/", "worker-configuration.d.ts", "drizzle/", "public/"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // Loose row shapes in scripts and test helpers.
    files: ["scripts/**", "tests/**"],
    rules: { "@typescript-eslint/no-explicit-any": "warn" },
  },
  {
    // Client scripts type API payloads as any; typing them is backlog #24.
    files: ["src/pages/miracles/index.astro/**", "src/pages/saints/index.astro/**", "src/pages/miracles/index.astro", "src/pages/saints/index.astro"],
    rules: { "@typescript-eslint/no-explicit-any": "warn" },
  },
);
