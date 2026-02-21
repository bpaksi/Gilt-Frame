import type { Metadata } from "next";
import { getMomentByShareToken } from "@/lib/actions/moments";
import { gameConfig } from "@/config";
import MarkerSVG from "@/components/ui/MarkerSVG";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const moment = await getMomentByShareToken(token);

  if (!moment) {
    return { title: "The Order of the Gilt Frame" };
  }

  const chapterName = moment.chapter_id
    ? gameConfig.chapters[moment.chapter_id]?.name ?? ""
    : "";

  const description = moment.narrative_text
    ? moment.narrative_text.slice(0, 160)
    : "A moment from the Order of the Gilt Frame.";

  return {
    title: chapterName
      ? `${chapterName} — The Order of the Gilt Frame`
      : "The Order of the Gilt Frame",
    description,
    openGraph: {
      title: chapterName || "The Order of the Gilt Frame",
      description,
      images: [`/api/og/${token}`],
    },
  };
}

export default async function SharedMomentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const moment = await getMomentByShareToken(token);

  if (!moment) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", bottom: "32px", right: "32px", opacity: 0.15 }}>
          <MarkerSVG size={32} variant="gold" />
        </div>
        <p
          style={{
            color: "rgba(200, 165, 75, 0.5)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "16px",
            fontStyle: "italic",
            letterSpacing: "1px",
            textAlign: "center",
            lineHeight: 1.8,
          }}
        >
          This moment is not yet ready to be shared.
        </p>
      </div>
    );
  }

  const chapter = moment.chapter_id
    ? gameConfig.chapters[moment.chapter_id]
    : null;

  const date = new Date(moment.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const lines = moment.narrative_text
    ? moment.narrative_text.split(/(?<=\.)\s+/).filter((l) => l.trim())
    : [];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        gap: "28px",
        position: "relative",
      }}
    >
      {/* Chapter name */}
      {chapter && (
        <p
          style={{
            color: "rgba(200, 165, 75, 0.4)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "3px",
          }}
        >
          {chapter.name}
        </p>
      )}

      {/* Date */}
      <p
        style={{
          color: "rgba(200, 165, 75, 0.25)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "12px",
        }}
      >
        {date}
      </p>

      {/* Narrative lines */}
      {lines.map((line, i) => (
        <p
          key={`${i}-${line}`}
          style={{
            color: "rgba(200, 165, 75, 0.8)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "18px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.8,
            maxWidth: "380px",
            opacity: 0,
            animation: `fade-in 0.8s ease forwards`,
            animationDelay: `${i * 500}ms`,
          }}
        >
          {line}
        </p>
      ))}

      {/* Footer */}
      <p
        style={{
          color: "rgba(200, 165, 75, 0.25)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "12px",
          fontStyle: "italic",
          textAlign: "center",
          marginTop: "40px",
          letterSpacing: "0.5px",
        }}
      >
        This is one moment from a larger journey.
      </p>

      {/* Watermark */}
      <div style={{ position: "absolute", bottom: "32px", right: "32px", opacity: 0.15 }}>
        <MarkerSVG size={32} variant="gold" />
      </div>
    </div>
  );
}
