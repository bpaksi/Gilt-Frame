import type { ComponentType } from "react";
import type { ComponentName } from "@/config";
import { lazy } from "react";

const WayfindingCompass = lazy(() => import("./WayfindingCompass"));
const MarkerButton = lazy(() => import("./MarkerButton"));
const MultipleChoice = lazy(() => import("./MultipleChoice"));

const CompassPuzzle = lazy(() => import("./CompassPuzzle"));
const RewardReveal = lazy(() => import("./RewardReveal"));
const WaitingStateQuest = lazy(() => import("../WaitingState"));
const PassphrasePuzzle = lazy(() => import("./PassphrasePuzzle"));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentRegistry: Record<ComponentName, ComponentType<any>> = {
  WayfindingCompass,
  MarkerButton,
  MultipleChoice,

  CompassPuzzle,
  RewardReveal,
  WaitingState: WaitingStateQuest,
  PassphrasePuzzle,
};
