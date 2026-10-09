# Lint Setup (backlog #28)

CLAUDE.md describes CI as typecheck -> lint -> test, but no linter exists.

## Scope
- ESLint 9 flat config with typescript-eslint and eslint-plugin-astro (matches the ESLint choice already named in CLAUDE.md).
- `npm run lint` and a Lint step in `.github/workflows/ci.yml` (after Typecheck).
- Rules start from the recommended sets. `no-explicit-any` is on. Existing violations are fixed only when trivial; otherwise the rule is set to `warn` for them so CI passes, and the count is recorded.
- Update the Lint line in CLAUDE.md.

## Out of scope
- Prettier / mass reformatting. The codebase style is not Prettier-formatted, and a repo-wide reformat would conflict with the planned refactors (#21, #23-#25). Revisit after those land.
- Refactoring code to satisfy style rules beyond trivial fixes.

## Done when
`npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass, and CI runs lint.
