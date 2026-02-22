"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { componentRegistry } from "@/components/game/quest/registry";
import FadeTransition from "@/components/game/FadeTransition";
import type { QuestState } from "@/lib/actions/quest";
import { advanceQuest } from "@/lib/actions/quest";

interface QuestRunnerProps {
  initialState: QuestState;
}

export default function QuestRunner({ initialState }: QuestRunnerProps) {
  const [state, setState] = useState(initialState);
  const [prevInitialState, setPrevInitialState] = useState(initialState);
  const router = useRouter();

  // Sync with server on initial state changes (render-time reset)
  if (initialState !== prevInitialState) {
    setPrevInitialState(initialState);
    setState(initialState);
  }

  const handleAdvance = useCallback(async () => {
    if (!state.chapterId || state.stepIndex === undefined) return;
    const next = await advanceQuest(state.chapterId, state.stepIndex);
    setState(next);
    router.refresh();
  }, [state.chapterId, state.stepIndex, router]);


  if (state.status !== "active" || !state.component) {
    return null;
  }

  const Component = componentRegistry[state.component];
  if (!Component) return null;

  return (
    <FadeTransition stateKey={`${state.chapterId}-${state.stepIndex}`}>
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              minHeight: "100%",
            }}
          />
        }
      >
        <Component
          config={state.config}
          onAdvance={handleAdvance}
          chapterId={state.chapterId}
          chapterName={state.chapterName}
          stepIndex={state.stepIndex}
          revealedHintTiers={state.revealedHintTiers}
        />
      </Suspense>
    </FadeTransition>
  );
}
