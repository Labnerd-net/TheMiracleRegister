-- Full-text search for /api/v1/search and /search (backlog #55).
-- search_vector is a stored generated column, so edits made outside the app (importer, Neon console)
-- keep it current. It is not declared in the Drizzle schema on purpose: it is never selected or written
-- by the app, only queried through src/lib/search.ts.
CREATE EXTENSION IF NOT EXISTS unaccent;
--> statement-breakpoint
-- unaccent() is STABLE, which Postgres will not accept in a generated column or an index. This wrapper
-- pins the dictionary and declares it IMMUTABLE (the dictionary does not change at runtime).
CREATE OR REPLACE FUNCTION immutable_unaccent(text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
  AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$;
--> statement-breakpoint
ALTER TABLE saints ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', immutable_unaccent(coalesce(name, ''))), 'A') ||
  setweight(to_tsvector('english', immutable_unaccent(coalesce(biography_short, ''))), 'C')
) STORED;
--> statement-breakpoint
ALTER TABLE miracles ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', immutable_unaccent(coalesce(title, ''))), 'A') ||
  setweight(to_tsvector('english', immutable_unaccent(coalesce(medical_diagnosis, ''))), 'B') ||
  setweight(to_tsvector('english', immutable_unaccent(coalesce(cure_details, ''))), 'C') ||
  setweight(to_tsvector('english', immutable_unaccent(coalesce(synopsis, ''))), 'C')
) STORED;
--> statement-breakpoint
CREATE INDEX saints_search_vector_idx ON saints USING GIN (search_vector);
--> statement-breakpoint
CREATE INDEX miracles_search_vector_idx ON miracles USING GIN (search_vector);
