-- Bump updated_at on every UPDATE at the database level, so edits made outside the app
-- (Neon console, run_sql) behave the same as Drizzle's app-level $onUpdate.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DROP TRIGGER IF EXISTS saints_set_updated_at ON saints;
--> statement-breakpoint
CREATE TRIGGER saints_set_updated_at BEFORE UPDATE ON saints
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS miracles_set_updated_at ON miracles;
--> statement-breakpoint
CREATE TRIGGER miracles_set_updated_at BEFORE UPDATE ON miracles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
