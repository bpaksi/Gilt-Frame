"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { componentRegistry } from "./registry";
import StateFader from "./StateFader";
import type { QuestState } from "@/lib/actions/quest";
import { advanceQuest, pollChapterProgress } from "@/lib/actions/quest";

interface QuestStateMachineProps {
  initialState: QuestState;
}

export default function QuestStateMachine({ initialState }: QuestStateMachineProps) {
  const [state, setState] = useState(initialState);
  const [prevInitialState, setPrevInitialState] = useState(initialState);
  const router = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

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

  // Poll for admin-triggered advances
  useEffect(() => {
    if (state.advance !== "admin_trigger" || !state.chapterId) return;

    pollRef.current = setInterval(async () => {
      if (!state.chapterId) return;
      const result = await pollChapterProgress(state.chapterId);
      if (result && result.stepIndex !== state.stepIndex) {
        router.refresh();
      }
    }, 30_000);

    return () => clearInterval(pollRef.current);
  }, [state.advance, state.chapterId, state.stepIndex, router]);

  if (state.status !== "active" || !state.component) {
    return null;
  }

  const Component = componentRegistry[state.component];
  if (!Component) return null;

  return (
    <StateFader stateKey={`${state.chapterId}-${state.stepIndex}`}>
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
    </StateFader>
  );
}
