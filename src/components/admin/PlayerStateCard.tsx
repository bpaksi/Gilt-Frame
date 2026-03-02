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
  const isActive = state.status === "active";

  return (
    <div className="admin-card p-4 mb-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {isActive ? (
            <>
              <div className="text-[10px] font-semibold tracking-[1px] uppercase text-admin-text-faint mb-0.5">
                Chapter {chapterNum ?? ""}
              </div>
              <div className="text-base font-semibold text-admin-text-dark">
                {state.chapterName}
              </div>
              {state.stepName && (
                <div className="text-[12px] text-admin-text-muted mt-0.5">
                  {state.stepName}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm font-medium text-admin-text-muted">
              Nothing active
            </div>
          )}
        </div>
        <span
          className={`shrink-0 text-[10px] font-bold tracking-[1px] uppercase px-2 py-1 rounded-md ${
            isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {isActive ? "Active" : "Idle"}
        </span>
      </div>
    </div>
  );
}
