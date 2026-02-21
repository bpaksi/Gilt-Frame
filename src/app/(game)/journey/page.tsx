import type { Metadata } from "next";
import { resolveTrack } from "@/lib/track";
import { getMoments } from "@/lib/actions/moments";
import JourneyTimeline from "@/components/game/JourneyTimeline";

export const metadata: Metadata = {
  title: "Journey | The Order of the Gilt Frame",
};

export default async function JourneyPage() {
  const trackInfo = await resolveTrack();

  if (!trackInfo) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          flex: 1,
          padding: "40px 24px",
        }}
      >
        <p
          style={{
            color: "rgba(200, 165, 75, 0.5)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "16px",
            fontStyle: "italic",
            textAlign: "center",
            letterSpacing: "1px",
            lineHeight: 1.8,
          }}
        >
          Your journey has not yet begun.
        </p>
      </div>
    );
  }

  const moments = await getMoments(trackInfo.track);

  return <JourneyTimeline moments={moments} />;
}
