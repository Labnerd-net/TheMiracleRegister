-- Record a redirect whenever a saint or miracle slug changes, so edits made outside the app
-- (Neon console, run_sql) do not silently break the old public URL. TG_ARGV[0] is the
-- slug_entity_type ('saint' or 'miracle').
CREATE OR REPLACE FUNCTION record_slug_redirect() RETURNS trigger AS $$
BEGIN
  -- Renaming back to a slug that used to redirect: drop that redirect so it cannot loop.
  DELETE FROM slug_redirects
    WHERE entity_type = TG_ARGV[0]::slug_entity_type AND old_slug = NEW.slug;
  -- Keep chains to one hop: anything that pointed at the old slug now points at the new one.
  UPDATE slug_redirects SET new_slug = NEW.slug
    WHERE entity_type = TG_ARGV[0]::slug_entity_type AND new_slug = OLD.slug;
  INSERT INTO slug_redirects (entity_type, old_slug, new_slug)
    VALUES (TG_ARGV[0]::slug_entity_type, OLD.slug, NEW.slug)
    ON CONFLICT (entity_type, old_slug) DO UPDATE SET new_slug = EXCLUDED.new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DROP TRIGGER IF EXISTS saints_slug_redirect ON saints;
--> statement-breakpoint
CREATE TRIGGER saints_slug_redirect AFTER UPDATE OF slug ON saints
  FOR EACH ROW WHEN (OLD.slug IS DISTINCT FROM NEW.slug)
  EXECUTE FUNCTION record_slug_redirect('saint');
--> statement-breakpoint
DROP TRIGGER IF EXISTS miracles_slug_redirect ON miracles;
--> statement-breakpoint
CREATE TRIGGER miracles_slug_redirect AFTER UPDATE OF slug ON miracles
  FOR EACH ROW WHEN (OLD.slug IS DISTINCT FROM NEW.slug)
  EXECUTE FUNCTION record_slug_redirect('miracle');
