export type ShowcaseCategory = "ui" | "game" | "quest";

/** Gallery behavior for a callback prop. "done" triggers the done overlay; "noop" is a placeholder. */
export type ShowcaseCallback = "done" | "noop";

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
   * "done" — calling this callback signals the component has completed its purpose.
   * "noop" — data/event callback; wired as a no-op placeholder.
   */
  callbacks?: Record<string, ShowcaseCallback>;
};
