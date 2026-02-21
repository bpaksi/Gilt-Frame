import { gameConfig } from "@/config";
import type { PlayerState } from "@/lib/admin/actions";

function getChapterNumber(chapterId: string | null): number | null {
  if (!chapterId) return null;
  const ids = Object.keys(gameConfig.chapters);
  const idx = ids.indexOf(chapterId);
  return idx >= 0 ? idx : null;
}

export default function PlayerStateCard({
  state,
}: {
  state: PlayerState;
}) {
  const chapterNum = getChapterNumber(state.chapterId);

  return (
    <div className="admin-card p-4 mb-4">
      {state.chapterName ? (
        <>
          <div className="text-[10px] font-semibold tracking-[1px] uppercase text-admin-text-faint mb-0.5">
            Chapter {chapterNum ?? ""}
          </div>
          <div className="text-base font-semibold text-admin-text-dark">
            {state.chapterName}
          </div>
        </>
      ) : (
        <div className="text-sm text-admin-text-faint">
          No active workflow. Activate one from Settings.
        </div>
      )}
    </div>
  );
}
