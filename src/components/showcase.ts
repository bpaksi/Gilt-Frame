export type ShowcaseCategory = "ui" | "game" | "quest";

/**
 * Gallery behavior for a callback prop.
 * "done"   — calling this signals the component completed its purpose; triggers the done overlay.
 * "noop"   — data/lifecycle callback; wired as a no-op placeholder.
 * "action" — async DB action; the gallery injects a test-scoped implementation from its action registry.
 */
export type ShowcaseCallback = "done" | "noop" | "action";

export type ShowcaseDefinition<Props = unknown> = {
  category: ShowcaseCategory;
  label: string;
  description: string;
  /** IDs of other gallery components this component renders internally */
  uses?: string[];
  defaults?: Partial<Props>;
  /**
   * Declares all callback props this component expects and their gallery role.
   * Every function prop should appear here so the gallery can wire it automatically.
   */
  callbacks?: Record<string, ShowcaseCallback>;
};
