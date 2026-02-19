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
          color: "#666666",
          marginBottom: "12px",
        }}
      >
        AI Chat Review
      </div>
      <OracleReview />
    </div>
  );
}
