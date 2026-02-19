import OracleReview from "@/components/admin/settings/OracleReview";

export default function OracleSettingsPage() {
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
        Oracle Review
      </div>
      <OracleReview />
    </div>
  );
}
