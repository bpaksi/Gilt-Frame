import ChapterEditor from "@/components/admin/settings/ChapterEditor";

export default function ChaptersSettingsPage() {
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
        Chapters & Quests
      </div>
      <ChapterEditor />
    </div>
  );
}
