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
    <div
      style={{
        background: "#fff",
        border: "1px solid #d0d0d0",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      {state.chapterName ? (
        <>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "#999999", marginBottom: "2px" }}>
            Chapter {chapterNum ?? ""}
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            {state.chapterName}
          </div>
        </>
      ) : (
        <div style={{ fontSize: "14px", color: "#999999" }}>
          No active workflow. Activate one from Settings.
        </div>
      )}
    </div>
  );
}
