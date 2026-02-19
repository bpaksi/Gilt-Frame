import type { PlayerState } from "@/lib/admin/actions";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "No activity";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function PlayerStateCard({ state }: { state: PlayerState }) {
  const trackColor = state.track === "live" ? "#c62828" : "#336699";

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#fff",
            background: trackColor,
            padding: "2px 8px",
            borderRadius: "4px",
          }}
        >
          {state.track}
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color:
              state.status === "active"
                ? "#2e7d32"
                : state.status === "idle"
                  ? "#999999"
                  : "#666666",
          }}
        >
          {state.status}
        </span>
      </div>

      {state.chapterName ? (
        <>
          <div
            style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}
          >
            {state.chapterName}
          </div>
          {state.location && (
            <div style={{ fontSize: "13px", color: "#666666", marginBottom: "8px" }}>
              {state.location}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: "16px",
              fontSize: "12px",
              color: "#666666",
              flexWrap: "wrap",
            }}
          >
            <span>
              Step: <strong style={{ color: "#333333" }}>{state.stepName ?? `#${state.stepIndex}`}</strong>
            </span>
            <span>
              Last: <strong style={{ color: "#333333" }}>{timeAgo(state.lastActivity)}</strong>
            </span>
          </div>
          {state.lastActionSummary && (
            <div
              style={{
                fontSize: "11px",
                color: "#999999",
                marginTop: "6px",
              }}
            >
              {state.lastActionSummary}
            </div>
          )}
        </>
      ) : (
        <div style={{ fontSize: "14px", color: "#999999" }}>
          No active workflow. Activate one from Settings.
        </div>
      )}
    </div>
  );
}
