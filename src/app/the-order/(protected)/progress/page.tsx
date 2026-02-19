import { getAdminTrack } from "@/lib/admin/track";
import { getPlayerEvents } from "@/lib/admin/actions";
import EventTimeline from "@/components/admin/EventTimeline";

export default async function AdminProgressPage() {
  const track = await getAdminTrack();
  const events = await getPlayerEvents(track);

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
        Event Timeline
      </div>
      <EventTimeline events={events} />
    </div>
  );
}
