import type { ComponentType } from "react";
import type { ShowcaseDefinition, ShowcaseCategory } from "@/components/showcase";

// ── UI Primitives ────────────────────────────────────────────────────────────
import GhostButton, { showcase as ghostButton } from "@/components/ui/GhostButton";
import TextButton, { showcase as textButton } from "@/components/ui/TextButton";
import OptionButton, { showcase as optionButton } from "@/components/ui/OptionButton";
import GoldText, { showcase as goldText } from "@/components/ui/GoldText";
import UppercaseLabel, { showcase as uppercaseLabel } from "@/components/ui/UppercaseLabel";
import OrnateDivider, { showcase as ornateDivider } from "@/components/ui/OrnateDivider";
import EmptyState, { showcase as emptyState } from "@/components/ui/EmptyState";
import AmbientParticles, { showcase as ambientParticles } from "@/components/ui/AmbientParticles";
import MarkerSVG, { showcase as markerSVG } from "@/components/ui/MarkerSVG";
import Accordion, { showcase as accordion } from "@/components/ui/Accordion";

// ── Game Building Blocks ─────────────────────────────────────────────────────
import PageLayout, { showcase as pageLayout } from "@/components/game/PageLayout";
import WaitingScreen, { showcase as waitingScreen } from "@/components/game/WaitingScreen";
import TapToContinue, { showcase as tapToContinue } from "@/components/game/TapToContinue";
import AnswerQuestion, { showcase as answerQuestion } from "@/components/game/AnswerQuestion";
import CompassRose, { showcase as compassRose } from "@/components/game/CompassRose";
import HintSystem, { showcase as hintSystem } from "@/components/game/HintSystem";
import RevealLines, { showcase as revealLines } from "@/components/game/RevealLines";
import FollowDirections, { showcase as followDirections } from "@/components/game/FollowDirections";
import UnlockAnimation, { showcase as unlockAnimation } from "@/components/game/UnlockAnimation";
import CompletionCountdown, { showcase as completionCountdown } from "@/components/game/CompletionCountdown";

// ── Quest Components ─────────────────────────────────────────────────────────
import FindByGps, { showcase as findByGps } from "@/components/game/quest/FindByGps";
import MultipleChoice, { showcase as multipleChoice } from "@/components/game/quest/MultipleChoice";
import AlignBearing, { showcase as alignBearing } from "@/components/game/quest/AlignBearing";
import RevealNarrative, { showcase as revealNarrative } from "@/components/game/quest/RevealNarrative";
import PassphraseEntry, { showcase as passphraseEntry } from "@/components/game/quest/PassphraseEntry";
import FindByText, { showcase as findByText } from "@/components/game/quest/FindByText";

export type ShowcaseEntry = {
  id: string;
  /** Canonical source file path for easy reference when discussing changes */
  filePath: string;
  showcase: ShowcaseDefinition;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: ComponentType<any>;
};

const ALL_ENTRIES: ShowcaseEntry[] = [
  // UI
  { id: "GhostButton",      filePath: "src/components/ui/GhostButton.tsx",      showcase: ghostButton,      Component: GhostButton },
  { id: "TextButton",       filePath: "src/components/ui/TextButton.tsx",        showcase: textButton,       Component: TextButton },
  { id: "OptionButton",     filePath: "src/components/ui/OptionButton.tsx",      showcase: optionButton,     Component: OptionButton },
  { id: "GoldText",         filePath: "src/components/ui/GoldText.tsx",          showcase: goldText,         Component: GoldText },
  { id: "UppercaseLabel",   filePath: "src/components/ui/UppercaseLabel.tsx",    showcase: uppercaseLabel,   Component: UppercaseLabel },
  { id: "OrnateDivider",    filePath: "src/components/ui/OrnateDivider.tsx",     showcase: ornateDivider,    Component: OrnateDivider },
  { id: "EmptyState",       filePath: "src/components/ui/EmptyState.tsx",        showcase: emptyState,       Component: EmptyState },
  { id: "AmbientParticles", filePath: "src/components/ui/AmbientParticles.tsx",  showcase: ambientParticles, Component: AmbientParticles },
  { id: "MarkerSVG",        filePath: "src/components/ui/MarkerSVG.tsx",         showcase: markerSVG,        Component: MarkerSVG },
  { id: "Accordion",        filePath: "src/components/ui/Accordion.tsx",         showcase: accordion,        Component: Accordion },
  // Game
  { id: "PageLayout",          filePath: "src/components/game/PageLayout.tsx",          showcase: pageLayout,          Component: PageLayout },
  { id: "WaitingScreen",       filePath: "src/components/game/WaitingScreen.tsx",       showcase: waitingScreen,       Component: WaitingScreen },
  { id: "TapToContinue",       filePath: "src/components/game/TapToContinue.tsx",       showcase: tapToContinue,       Component: TapToContinue },
  { id: "AnswerQuestion",      filePath: "src/components/game/AnswerQuestion.tsx",      showcase: answerQuestion,      Component: AnswerQuestion },
  { id: "CompassRose",         filePath: "src/components/game/CompassRose.tsx",         showcase: compassRose,         Component: CompassRose },
  { id: "HintSystem",          filePath: "src/components/game/HintSystem.tsx",          showcase: hintSystem,          Component: HintSystem },
  { id: "RevealLines",         filePath: "src/components/game/RevealLines.tsx",         showcase: revealLines,         Component: RevealLines },
  { id: "FollowDirections",    filePath: "src/components/game/FollowDirections.tsx",    showcase: followDirections,    Component: FollowDirections },
  { id: "UnlockAnimation",     filePath: "src/components/game/UnlockAnimation.tsx",     showcase: unlockAnimation,     Component: UnlockAnimation },
  { id: "CompletionCountdown", filePath: "src/components/game/CompletionCountdown.tsx", showcase: completionCountdown, Component: CompletionCountdown },
  // Quest
  { id: "FindByGps",       filePath: "src/components/game/quest/FindByGps.tsx",       showcase: findByGps,       Component: FindByGps },
  { id: "MultipleChoice",  filePath: "src/components/game/quest/MultipleChoice.tsx",  showcase: multipleChoice,  Component: MultipleChoice },
  { id: "AlignBearing",    filePath: "src/components/game/quest/AlignBearing.tsx",    showcase: alignBearing,    Component: AlignBearing },
  { id: "RevealNarrative", filePath: "src/components/game/quest/RevealNarrative.tsx", showcase: revealNarrative, Component: RevealNarrative },
  { id: "PassphraseEntry", filePath: "src/components/game/quest/PassphraseEntry.tsx", showcase: passphraseEntry, Component: PassphraseEntry },
  { id: "FindByText",      filePath: "src/components/game/quest/FindByText.tsx",      showcase: findByText,      Component: FindByText },
];

/** Map of component ID → IDs of components that use it (computed from `uses` declarations) */
const USED_BY_MAP: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const entry of ALL_ENTRIES) {
    for (const dep of entry.showcase.uses ?? []) {
      const existing = map.get(dep) ?? [];
      existing.push(entry.id);
      map.set(dep, existing);
    }
  }
  return map;
})();

export function getEntriesByCategory(category: ShowcaseCategory): ShowcaseEntry[] {
  return ALL_ENTRIES.filter((e) => e.showcase.category === category);
}

export function getEntryById(id: string): ShowcaseEntry | undefined {
  return ALL_ENTRIES.find((e) => e.id === id);
}

/** Returns IDs of gallery components that render this component internally */
export function getUsedBy(id: string): string[] {
  return USED_BY_MAP.get(id) ?? [];
}

export { ALL_ENTRIES };
