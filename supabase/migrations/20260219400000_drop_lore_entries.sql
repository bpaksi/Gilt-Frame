-- Lore entries migrated to static Markdown files in src/config/lore/
DROP POLICY IF EXISTS "Public read lore" ON lore_entries;
DROP TABLE IF EXISTS lore_entries;
