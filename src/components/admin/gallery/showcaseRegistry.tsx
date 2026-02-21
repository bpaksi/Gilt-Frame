import type { ComponentType } from "react";
import type { ShowcaseDefinition, ShowcaseCategory } from "@/components/showcase";

// ── UI Primitives ────────────────────────────────────────────────────────────
import GhostButton, { showcase as ghostButton } from "@/components/ui/GhostButton";
import TextButton, { showcase as textButton } from "@/components/ui/TextButton";
import OptionButton, { showcase as optionButton } from "@/components/ui/OptionButton";
import GoldText, { showcase as goldText } from "@/components/ui/GoldText";
import UppercaseLabel, { showcase as uppercaseLabel } from "@/components/ui/UppercaseLabel";
import WaveDivider, { showcase as waveDivider } from "@/components/ui/WaveDivider";
import EmptyState, { showcase as emptyState } from "@/components/ui/EmptyState";
import AmbientParticles, { showcase as ambientParticles } from "@/components/ui/AmbientParticles";
import MarkerSVG, { showcase as markerSVG } from "@/components/ui/MarkerSVG";
import Accordion, { showcase as accordion } from "@/components/ui/Accordion";

// ── Game Building Blocks ─────────────────────────────────────────────────────
import GiltFrame, { showcase as giltFrame } from "@/components/game/GiltFrame";
import WaitingState, { showcase as waitingState } from "@/components/game/WaitingState";
import MarkerAnimation, { showcase as markerAnimation } from "@/components/game/MarkerAnimation";
import HintSystem, { showcase as hintSystem } from "@/components/game/HintSystem";
import TextReveal, { showcase as textReveal } from "@/components/game/TextReveal";
import CompassPermission, { showcase as compassPermission } from "@/components/game/CompassPermission";
import IndoorWayfinding, { showcase as indoorWayfinding } from "@/components/game/IndoorWayfinding";
import CeremonyAnimation, { showcase as ceremonyAnimation } from "@/components/game/CeremonyAnimation";

// ── Quest Components ─────────────────────────────────────────────────────────
import WayfindingCompass, { showcase as wayfindingCompass } from "@/components/game/quest/WayfindingCompass";
import MarkerButton, { showcase as markerButton } from "@/components/game/quest/MarkerButton";
import MultipleChoice, { showcase as multipleChoice } from "@/components/game/quest/MultipleChoice";
import CompassPuzzle, { showcase as compassPuzzle } from "@/components/game/quest/CompassPuzzle";
import RewardReveal, { showcase as rewardReveal } from "@/components/game/quest/RewardReveal";
import PassphrasePuzzle, { showcase as passphrasePuzzle } from "@/components/game/quest/PassphrasePuzzle";
import GuidedIdentification, { showcase as guidedIdentification } from "@/components/game/quest/GuidedIdentification";

export type ShowcaseEntry = {
  id: string;
  showcase: ShowcaseDefinition;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: ComponentType<any>;
};

const ALL_ENTRIES: ShowcaseEntry[] = [
  // UI
  { id: "GhostButton", showcase: ghostButton, Component: GhostButton },
  { id: "TextButton", showcase: textButton, Component: TextButton },
  { id: "OptionButton", showcase: optionButton, Component: OptionButton },
  { id: "GoldText", showcase: goldText, Component: GoldText },
  { id: "UppercaseLabel", showcase: uppercaseLabel, Component: UppercaseLabel },
  { id: "WaveDivider", showcase: waveDivider, Component: WaveDivider },
  { id: "EmptyState", showcase: emptyState, Component: EmptyState },
  { id: "AmbientParticles", showcase: ambientParticles, Component: AmbientParticles },
  { id: "MarkerSVG", showcase: markerSVG, Component: MarkerSVG },
  { id: "Accordion", showcase: accordion, Component: Accordion },
  // Game
  { id: "GiltFrame", showcase: giltFrame, Component: GiltFrame },
  { id: "WaitingState", showcase: waitingState, Component: WaitingState },
  { id: "MarkerAnimation", showcase: markerAnimation, Component: MarkerAnimation },
  { id: "HintSystem", showcase: hintSystem, Component: HintSystem },
  { id: "TextReveal", showcase: textReveal, Component: TextReveal },
  { id: "CompassPermission", showcase: compassPermission, Component: CompassPermission },
  { id: "IndoorWayfinding", showcase: indoorWayfinding, Component: IndoorWayfinding },
  { id: "CeremonyAnimation", showcase: ceremonyAnimation, Component: CeremonyAnimation },
  // Quest
  { id: "WayfindingCompass", showcase: wayfindingCompass, Component: WayfindingCompass },
  { id: "MarkerButton", showcase: markerButton, Component: MarkerButton },
  { id: "MultipleChoice", showcase: multipleChoice, Component: MultipleChoice },
  { id: "CompassPuzzle", showcase: compassPuzzle, Component: CompassPuzzle },
  { id: "RewardReveal", showcase: rewardReveal, Component: RewardReveal },
  { id: "PassphrasePuzzle", showcase: passphrasePuzzle, Component: PassphrasePuzzle },
  { id: "GuidedIdentification", showcase: guidedIdentification, Component: GuidedIdentification },
];

export function getEntriesByCategory(category: ShowcaseCategory): ShowcaseEntry[] {
  return ALL_ENTRIES.filter((e) => e.showcase.category === category);
}

export function getEntryById(id: string): ShowcaseEntry | undefined {
  return ALL_ENTRIES.find((e) => e.id === id);
}

export { ALL_ENTRIES };
