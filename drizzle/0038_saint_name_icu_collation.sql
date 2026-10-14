-- The database's default C.UTF-8 collation sorts strings by raw byte value, which puts
-- every accented capital letter (e.g. "Ó") after all plain ASCII letters -- so ORDER BY name
-- sorted "Óscar Romero" after "Zélie Martin" instead of near "Padre Pio". The "unicode" ICU
-- collation sorts accented letters alongside their base letter, matching normal alphabetical
-- order, and (unlike locale-specific ICU collations such as "en-x-icu") is also available in
-- the PGlite build the test suite runs against.
--
-- saints.name is depended on by the generated search_vector column (migration 0037), and
-- Postgres refuses to change a column's type/collation while a generated column depends on
-- it, so search_vector and its index are dropped and recreated identically around the ALTER.
DROP INDEX saints_search_vector_idx;
--> statement-breakpoint
ALTER TABLE saints DROP COLUMN search_vector;
--> statement-breakpoint
ALTER TABLE saints ALTER COLUMN name TYPE text COLLATE "unicode";
--> statement-breakpoint
ALTER TABLE saints ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', immutable_unaccent(coalesce(name, ''))), 'A') ||
  setweight(to_tsvector('english', immutable_unaccent(coalesce(biography_short, ''))), 'C')
) STORED;
--> statement-breakpoint
CREATE INDEX saints_search_vector_idx ON saints USING GIN (search_vector);
