import type { ComponentType } from "react";
import type { ComponentName } from "@/config";
import { lazy } from "react";

const FindByGps = lazy(() => import("./FindByGps"));
const MultipleChoice = lazy(() => import("./MultipleChoice"));

const AlignBearing = lazy(() => import("./AlignBearing"));
const RevealNarrative = lazy(() => import("./RevealNarrative"));
const PassphraseEntry = lazy(() => import("./PassphraseEntry"));
const FindByText = lazy(() => import("./FindByText"));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentRegistry: Record<ComponentName, ComponentType<any>> = {
  FindByGps,
  MultipleChoice,

  AlignBearing,
  RevealNarrative,
  PassphraseEntry,
  FindByText,
};
