import { readdir } from "fs/promises";
import { join } from "path";
import { getPlayerState, getAllChapterProgress } from "@/lib/admin/actions";
import { gameConfig, getOrderedSteps, formatStepKey } from "@/config";
import TestingClient from "./TestingClient";

async function getEmailTemplates(): Promise<string[]> {
  const dir = join(process.cwd(), "src", "config", "email");
  const files = await readdir(dir);
  return files
    .filter((f) => f.endsWith(".html"))
    .map((f) => f.replace(".html", ""))
    .sort();
}

export default async function TestingPage() {
  const [templates, state, allProgress] = await Promise.all([
    getEmailTemplates(),
    getPlayerState("test"),
    getAllChapterProgress("test"),
  ]);

  const testPlayerEmail = gameConfig.tracks.test.player.email;
  const allChapterIds = Object.keys(gameConfig.chapters);

  // If a chapter is active, use it. Otherwise find the first chapter not yet completed
  // so "Complete Chapter" advances through the sequence rather than looping on ch0.
  const completedIds = new Set(
    allProgress.filter((cp) => cp.completed_at !== null).map((cp) => cp.chapter_id)
  );
  const chapterId =
    state.chapterId ??
    allChapterIds.find((id) => !completedIds.has(id)) ??
    allChapterIds[0];

  const chapter = gameConfig.chapters[chapterId];
  const chapterName = state.chapterName ?? chapter?.name ?? chapterId;

  // Determine if there's an active chapter and whether its current step is a website step
  const isChapterActive = !!state.chapterId;
  let currentStepId: string | null = null;
  let currentStepName: string | null = null;

  if (state.chapterId) {
    const activeChapter = gameConfig.chapters[state.chapterId];
    if (activeChapter) {
      const orderedSteps = getOrderedSteps(activeChapter);
      const currentStep = orderedSteps[state.stepIndex ?? 0];
      if (currentStep && currentStep.type === "website") {
        currentStepId = currentStep.id;
        currentStepName = formatStepKey(currentStep.id);
      }
    }
  }

  return (
    <div className="p-4 md:py-10 md:px-6 max-w-2xl">
      <h1 className="font-sans text-xl font-normal tracking-[2px] uppercase m-0 mb-8">
        Testing
      </h1>

      <TestingClient
        templates={templates}
        testPlayerEmail={testPlayerEmail}
        chapterId={chapterId}
        chapterName={chapterName}
        isChapterActive={isChapterActive}
        currentStepId={currentStepId}
        currentStepName={currentStepName}
      />
    </div>
  );
}
