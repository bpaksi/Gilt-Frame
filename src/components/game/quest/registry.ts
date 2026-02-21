import type { ComponentType } from "react";
import type { ComponentName } from "@/config";
import { lazy } from "react";

const FindByGps = lazy(() => import("./FindByGps"));
const MultipleChoice = lazy(() => import("./MultipleChoice"));

const BearingPuzzle = lazy(() => import("./BearingPuzzle"));
const StoryReveal = lazy(() => import("./StoryReveal"));
const PassphraseEntry = lazy(() => import("./PassphraseEntry"));
const FindByText = lazy(() => import("./FindByText"));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentRegistry: Record<ComponentName, ComponentType<any>> = {
  FindByGps,
  MultipleChoice,

  BearingPuzzle,
  StoryReveal,
  PassphraseEntry,
  FindByText,
};
