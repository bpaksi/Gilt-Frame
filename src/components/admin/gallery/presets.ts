import { gameConfig, getOrderedSteps, type ComponentName, type ComponentConfig } from "@/config";

export type Preset = {
  label: string;
  chapterId: string;
  stepIndex: number;
  component: ComponentName;
  config: ComponentConfig;
};

/**
 * Extracts all website step configs from gameConfig as gallery presets.
 */
export function getPresets(): Preset[] {
  const presets: Preset[] = [];

  for (const [chapterId, chapter] of Object.entries(gameConfig.chapters)) {
    const steps = getOrderedSteps(chapter);
    steps.forEach((step, index) => {
      if (step.type === "website") {
        presets.push({
          label: `${chapter.name} — ${step.name}`,
          chapterId,
          stepIndex: index,
          component: step.component,
          config: step.config as ComponentConfig,
        });
      }
    });
  }

  return presets;
}
