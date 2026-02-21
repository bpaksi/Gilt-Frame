export type ShowcaseCategory = "ui" | "game" | "quest";

export type ShowcaseDefinition<Props = unknown> = {
  category: ShowcaseCategory;
  label: string;
  description: string;
  defaults?: Partial<Props>;
};
