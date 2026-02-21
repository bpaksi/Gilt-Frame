export type ShowcaseCategory = "ui" | "game" | "quest";

export type ShowcaseDefinition<Props = unknown> = {
  category: ShowcaseCategory;
  label: string;
  description: string;
  /** IDs of other gallery components this component renders internally */
  uses?: string[];
  defaults?: Partial<Props>;
};
