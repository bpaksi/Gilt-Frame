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
import GiltFrame, { showcase as giltFrame } from "@/components/game/GiltFrame";
import WaitingState, { showcase as waitingState } from "@/components/game/WaitingState";
import MarkerTap, { showcase as markerTap } from "@/components/game/MarkerTap";
import QuizQuestion, { showcase as quizQuestion } from "@/components/game/QuizQuestion";
import CompassRose, { showcase as compassRose } from "@/components/game/CompassRose";
import MarkerAnimation, { showcase as markerAnimation } from "@/components/game/MarkerAnimation";
import HintSystem, { showcase as hintSystem } from "@/components/game/HintSystem";
import TextReveal, { showcase as textReveal } from "@/components/game/TextReveal";
import IndoorWayfinding, { showcase as indoorWayfinding } from "@/components/game/IndoorWayfinding";
import CeremonyAnimation, { showcase as ceremonyAnimation } from "@/components/game/CeremonyAnimation";
import LockingCountdown, { showcase as lockingCountdown } from "@/components/game/LockingCountdown";

// ── Quest Components ─────────────────────────────────────────────────────────
import FindByGps, { showcase as findByGps } from "@/components/game/quest/FindByGps";
import MultipleChoice, { showcase as multipleChoice } from "@/components/game/quest/MultipleChoice";
import BearingPuzzle, { showcase as bearingPuzzle } from "@/components/game/quest/BearingPuzzle";
import StoryReveal, { showcase as storyReveal } from "@/components/game/quest/StoryReveal";
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
  { id: "GiltFrame",         filePath: "src/components/game/GiltFrame.tsx",          showcase: giltFrame,         Component: GiltFrame },
  { id: "WaitingState",      filePath: "src/components/game/WaitingState.tsx",        showcase: waitingState,      Component: WaitingState },
  { id: "MarkerTap",         filePath: "src/components/game/MarkerTap.tsx",           showcase: markerTap,         Component: MarkerTap },
  { id: "QuizQuestion",      filePath: "src/components/game/QuizQuestion.tsx",        showcase: quizQuestion,      Component: QuizQuestion },
  { id: "CompassRose",       filePath: "src/components/game/CompassRose.tsx",         showcase: compassRose,       Component: CompassRose },
  { id: "MarkerAnimation",   filePath: "src/components/game/MarkerAnimation.tsx",     showcase: markerAnimation,   Component: MarkerAnimation },
  { id: "HintSystem",        filePath: "src/components/game/HintSystem.tsx",          showcase: hintSystem,        Component: HintSystem },
  { id: "TextReveal",        filePath: "src/components/game/TextReveal.tsx",          showcase: textReveal,        Component: TextReveal },
  { id: "IndoorWayfinding",  filePath: "src/components/game/IndoorWayfinding.tsx",    showcase: indoorWayfinding,  Component: IndoorWayfinding },
  { id: "CeremonyAnimation",   filePath: "src/components/game/CeremonyAnimation.tsx",    showcase: ceremonyAnimation,   Component: CeremonyAnimation },
  { id: "LockingCountdown",    filePath: "src/components/game/LockingCountdown.tsx",     showcase: lockingCountdown,    Component: LockingCountdown },
  // Quest
  { id: "FindByGps",       filePath: "src/components/game/quest/FindByGps.tsx",       showcase: findByGps,       Component: FindByGps },
  { id: "MultipleChoice",  filePath: "src/components/game/quest/MultipleChoice.tsx",  showcase: multipleChoice,  Component: MultipleChoice },
  { id: "BearingPuzzle",   filePath: "src/components/game/quest/BearingPuzzle.tsx",   showcase: bearingPuzzle,   Component: BearingPuzzle },
  { id: "StoryReveal",     filePath: "src/components/game/quest/StoryReveal.tsx",     showcase: storyReveal,     Component: StoryReveal },
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
