# Spec for github-actions-ci

Title: GitHub Actions CI
Branch: claude/feature/github-actions-ci
Spec file: context/specs/github-actions-ci.md

## Summary
Add continuous integration (backlog #21) so every pull request and every push to `main` is automatically typechecked, tested and built. CI is check-only: deploys remain with the Cloudflare Workers Builds connector, which deploys on push to `main`. To keep broken code from being deployed, the workflow moves to a PR flow with GitHub branch protection requiring the CI check before merge. The existing type errors (backlog #47) must be fixed first, otherwise the typecheck step fails on its first run. Linting (ESLint/Prettier) is explicitly deferred to a follow-up.

## Functional Requirements
- Fix all current `tsc --noEmit` errors: enum filter param typing in the miracles API route, the enum helper generics in the API schemas, and the untyped JSON responses in the API tests.
- Install `@astrojs/check` as a dev dependency and add a `typecheck` npm script that covers `.astro` files as well as `.ts` files.
- Add a GitHub Actions workflow that runs on pull requests and on pushes to `main`.
- The workflow runs, in order: install from lockfile, typecheck, unit tests, production build.
- The workflow does not deploy and holds no Cloudflare credentials.
- The test step receives `DATABASE_URL` from a GitHub repository secret.
- Pin the Node version used in CI and use dependency caching to keep runs fast.
- Cancel superseded runs on the same branch.
- Document the new PR-based workflow and required repository settings (branch protection, required check, secret) in the README or CLAUDE.md.
- Update `context/backlog.md` to mark #21 and #47 done.

## Possible Edge Cases
- Pull requests from forks do not receive repository secrets, so the test step fails for them.
- Tests currently run against the production Neon branch (backlog #22); CI runs add production read load and depend on production data being present.
- `astro build` may read environment variables at build time that are not available in CI.
- `astro check` may surface additional errors in `.astro` files that `tsc --noEmit` does not see.
- Cloudflare Workers Builds may build non-production branches, causing a build for every feature branch push.
- Rate-limit tests (or any test touching KV or Cloudflare bindings) may behave differently in the CI environment.
- Branch protection on private repositories requires a paid GitHub plan.
- Direct pushes to `main` bypass checks unless branch protection also applies to admins.

## Acceptance Criteria
- `npm run typecheck` passes locally with zero errors.
- `npm test` and `npm run build` still pass.
- Opening a PR triggers the workflow, and all steps pass on a clean branch.
- A PR with a deliberate type error or failing test shows a failed check.
- Pushing to `main` triggers the workflow.
- Branch protection on `main` requires the CI check to pass before merging.
- No deploy step or Cloudflare secret exists in the workflow.
- The documented workflow matches the actual repository settings.

## Open Questions
- Is the repository public or private, and does the GitHub plan allow branch protection?
- Does `astro build` need any environment variables at build time?
- Should CI wait for backlog #22 (isolated test database) or accept production reads in the interim?
- Should the scheduled `npm run check:data` job be included now or deferred?
- Should the "build non-production branches" setting be disabled in Cloudflare Workers Builds?
- Should admins be exempt from branch protection, given this is a solo project?

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- No new application logic is added, so no new test files are required.
- Existing API tests must compile under strict typing after the JSON response typing fix.
- Verify the pipeline itself by opening a PR with a deliberate failure and confirming the check fails, then fixing it and confirming it passes.

## Personal Opinion
Good idea, and long overdue: the project has tests and a build but nothing enforcing them, and deploy-on-push makes that riskier. Complexity is low: a small workflow, one dependency and a handful of type fixes. The scope is right, and deferring lint avoids a noisy first run.
- Biggest concern is tests depending on the production database (#22). CI makes this more visible, and fork PRs will fail. Mitigation: for now, restrict secret use to same-repo PRs and `main`; do #22 next.
- Moving to a PR flow adds friction for a solo workflow. Mitigation: keep it lightweight, with no required reviews, only the required check.
- Branch protection is a manual GitHub setting outside the codebase, so it can drift. Mitigation: document it and verify it once after setup.
- `astro check` may reveal more errors than the three known ones. Mitigation: budget for fixing them in this feature rather than silencing them.
