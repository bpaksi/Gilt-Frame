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
          color: "#6b7280",
          marginBottom: "12px",
        }}
      >
        Moments
      </div>
      <MomentsManager />
    </div>
  );
}
