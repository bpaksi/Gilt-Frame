"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { componentRegistry } from "@/components/game/quest/registry";
import FadeTransition from "@/components/game/FadeTransition";
import type { QuestState } from "@/lib/actions/quest";
import { advanceQuest, recordAnswer, revealHint } from "@/lib/actions/quest";

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

  const onHintReveal = useCallback(
    async (tier: number) => { await revealHint(state.chapterId!, state.stepIndex!, tier); },
    [state.chapterId, state.stepIndex]
  );

  const onAnswerRecord = useCallback(
    async (questionIndex: number, selectedOption: string, correct: boolean) => {
      await recordAnswer(state.chapterId!, state.stepIndex!, questionIndex, selectedOption, correct);
    },
    [state.chapterId, state.stepIndex]
  );


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
          revealedHintTiers={state.revealedHintTiers}
          onHintReveal={state.chapterId && state.stepIndex !== undefined ? onHintReveal : undefined}
          onAnswerRecord={state.chapterId && state.stepIndex !== undefined ? onAnswerRecord : undefined}
        />
      </Suspense>
    </FadeTransition>
  );
}
