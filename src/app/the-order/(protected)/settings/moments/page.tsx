import MomentsManager from "@/components/admin/settings/MomentsManager";

export default function MomentsSettingsPage() {
  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "#666666",
          marginBottom: "12px",
        }}
      >
        Snapshots
      </div>
      <MomentsManager />
    </div>
  );
}
