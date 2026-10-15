import fs from "node:fs";
import path from "node:path";

export type LoreEntry = {
  id: string;
  title: string;
  content: string;
  order: number;
  unlock_chapter_id: string | null;
};

/** Displayed lore entry with unlock state resolved. */
export type DisplayLoreEntry = LoreEntry & { unlocked: boolean };

// ─── Frontmatter parser ────────────────────────────────────────────────────────

function parseFrontmatter(raw: string): {
  data: Record<string, string | number | null>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw.trim() };

  const data: Record<string, string | number | null> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val: string | number | null = line.slice(idx + 1).trim();
    // Strip surrounding quotes
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val === "null") val = null;
    else if (/^\d+$/.test(val)) val = Number(val);
    data[key] = val;
  }
  return { data, content: match[2].trim() };
}

// ─── Loader (cached at module scope) ───────────────────────────────────────────

const LORE_DIR = path.join(process.cwd(), "src", "config", "lore");

let _cache: LoreEntry[] | null = null;

export function getAllLore(): LoreEntry[] {
  if (_cache) return _cache;

  const files = fs
    .readdirSync(LORE_DIR)
    .filter((f) => f.endsWith(".md") && f !== "CLAUDE.md")
    .sort();

  _cache = files.map((file) => {
    const raw = fs.readFileSync(path.join(LORE_DIR, file), "utf-8");
    const { data, content } = parseFrontmatter(raw);
    return {
      id: file.replace(/\.md$/, ""),
      title: data.title as string,
      content,
      order: data.order as number,
      unlock_chapter_id: (data.unlock_chapter_id as string | null) ?? null,
    };
  });

  return _cache;
}

export function getUnlockedLore(completedChapters: string[]): LoreEntry[] {
  return getAllLore().filter(
    (l) =>
      !l.unlock_chapter_id || completedChapters.includes(l.unlock_chapter_id)
  );
}
