# Spec for isolated-test-database

Title: Isolated Test Database
Branch: claude/feature/isolated-test-database
Spec file: context/specs/isolated-test-database.md

## Summary
API tests currently run against the real `DATABASE_URL`, which is the production Neon branch (backlog #22). They mostly check status codes and response envelope shape, so important behavior is untested. This feature makes the test suite self-contained: it runs against an isolated database holding known fixture data, never touches production, and needs no secrets. It then uses that known data to cover the behavior that matters most: filters, unpublished-record non-leakage, recipient privacy, the rate-limit path, cache headers and search. A side benefit is that CI works for pull requests from forks, which currently fail the test step because they receive no secrets.

## Functional Requirements
- Tests must not read or write production data, and must not require `DATABASE_URL` to be set to a real database.
- Tests run against an isolated database with a fixed set of fixture records that the tests control. The database schema comes from the project's real schema or migrations, so tests catch schema drift.
- Fixtures include, at minimum: published and unpublished saints and miracles, saints linked to miracles through the junction table, miracles with varying type, category, country, topics, approval authority and dates, records with each recipient privacy level, and at least one record for each searchable text field.
- Add assertions for the miracles and saints list endpoints covering each documented filter, pagination bounds, and combined filters.
- Add assertions that unpublished saints and miracles never appear in list, detail, search or related-record responses, and that detail endpoints return 404 for them.
- Add assertions that the recipient name is redacted in API output according to the recipient privacy level: removed for confidential, reduced to the first name for first-name-only, unchanged otherwise. Redaction applies to the recipient name field only; keeping restricted names out of free-text fields is a data rule enforced by the data check script, not by the API, and is out of scope for these tests.
- Add an assertion for the rate-limit path: after the allowed number of requests, the API returns 429 with the standard error envelope.
- Add assertions for the cache headers on each route group (saints, miracles, types, metadata, search).
- Add assertions for `/api/v1/search`: matching, no results, empty or invalid query handling, and exclusion of unpublished records.
- The existing assertions (envelope shape, 404s, types list, OpenAPI document) keep passing.
- Remove the production `DATABASE_URL` secret from the CI test step once tests no longer need it, and update the CI and `CLAUDE.md` documentation to match.
- Local `npm test` must work on a fresh checkout with no `.env`.
- Mark backlog #22 done and update the notes in `CLAUDE.md` that say tests read the production branch.

## Possible Edge Cases
- Fixture data drifts from the real schema when migrations change, so tests pass against an outdated shape.
- The test database differs from Neon Postgres in behavior (extensions, array operators, date functions, full-text search), so a query passes in tests and fails in production.
- The production database driver talks to Neon over HTTP, so a local test database may need a different driver or a way to substitute the database connection.
- Tests share state through the in-memory rate-limit store and interfere with each other.
- Test ordering or parallel runs create or delete fixtures that other tests depend on.
- A fixture puts a restricted recipient's name into a free-text field, which is invalid data under the data check rules and would be mistaken for an API redaction bug. Fixtures should use clearly fictional names.
- Date-dependent filters (year range) behave differently over time if fixtures use relative dates.
- The rate-limit test exhausts the limit for a shared client key and breaks later tests.

## Acceptance Criteria
- `npm test` passes on a clean checkout with no `.env` and no network access to Neon.
- Running the suite with `DATABASE_URL` pointing at an invalid host still passes, proving production is not touched.
- A deliberate change to a filter, to the published check, or to the privacy redaction makes at least one test fail.
- The CI test step passes for a pull request from a fork, with no repository secrets.
- The `DATABASE_URL` secret is no longer referenced by the CI workflow.
- Every item named in backlog #22 (filters, `published=false` non-leakage, 429 path, cache headers, `/api/v1/search`) has at least one meaningful test.
- Documentation no longer states that tests use the production database.

## Open Questions
- Feasibility result: an in-process Postgres-compatible database (PGlite) was tried against the real migrations and the real API app. All 31 migrations applied in about 2 seconds, including the updated-at triggers and the array indexes. Every query operator the API uses (array containment, array overlap, equals-any, year extraction, case-insensitive match, left-truncated excerpts) worked, as did the updated-at trigger. The database can be substituted in tests by replacing the database module for the test run, so no production code change appears necessary. Decision still needed: adopt this approach?
- How often should the test database be created? Migrations cost about 2 seconds, so creating it once per test file is likely fine, but a shared setup could cut this if the suite grows.
- Pages that import Cloudflare runtime modules cannot be loaded in the test runner, so only the API and shared library code are in scope. Is that acceptable?
- Should page-level (Astro) behavior such as the preview token be covered here, or only the API?
- Should fixtures be SQL files, TypeScript objects, or a small builder?
- Should `scripts/check-data.ts` also be exercised against the fixtures?
- How closely must the test database match Neon (extensions, full-text search configuration)?

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- List filters on miracles (type, category, country, topic, year range, saint, approval authority) return only matching published records, and combined filters narrow results.
- Pagination: page and limit are respected, out-of-range values are rejected, and totals are correct.
- Unpublished saints and miracles are absent from list, detail, search and linked-record responses, and detail returns 404.
- Recipient privacy levels redact the recipient name field as specified (confidential, first-name-only, public) on both list and detail responses.
- Exceeding the rate limit returns 429 with the error envelope, and the limit does not leak between tests.
- Cache headers match the configured values for each route group, and search is `no-store`.
- Search returns matches, handles no results, and handles empty or overly long queries.
- A test that fails loudly if the suite is configured to use a non-test database.

## Personal Opinion
Good idea, and the highest-value test work available. The current suite gives little protection, and the unpublished-record and privacy checks guard against the worst failures for a public data site. It is moderately complex: the hard part is the database substitution, not the assertions.
- Fidelity risk: an in-process database may not match Neon for array operators, date functions or text search. Mitigation: prefer a real Postgres engine, and keep a small number of smoke checks that confirm the key queries run.
- Production code seam: the experiment showed no refactor is needed, because the test run can replace the database module. The drawback is that the replacement hides the real driver; a small injectable factory would be cleaner and also supports backlog #36 (`createDb` boilerplate), but it is optional.
- Driver difference: production uses the Neon HTTP driver and tests would use an in-process driver. Query building is identical, but connection-level behavior (HTTP, no transactions) is not exercised. Mitigation: accept this, and keep a scheduled or manual smoke check against a real Neon branch if confidence is needed.
- Mocked query results are the cheapest option but would not test the filters or published checks, which are exactly what this feature is meant to cover. I would not choose that option.
- A per-run Neon branch gives the highest fidelity but needs an API key secret, which defeats the fork-PR goal and adds cost and cleanup. Mitigation: reserve it, if wanted, for a separate scheduled job.
- Scope is reasonable if page-level tests stay out. Mitigation: defer Astro page tests and Playwright (#29) to separate work.
