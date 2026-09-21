import { readFile } from "fs/promises";
import { join } from "path";

export async function loadEmailTemplate(
  template: string
): Promise<{ html: string; text: string }> {
  const dir = join(process.cwd(), "src", "config", "email");
  const [html, text] = await Promise.all([
    readFile(join(dir, `${template}.html`), "utf-8"),
    readFile(join(dir, `${template}.txt`), "utf-8"),
  ]);
  return { html, text };
}
