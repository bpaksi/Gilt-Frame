import { ImageResponse } from "next/og";
import { getMomentByShareToken } from "@/lib/actions/moments";
import { gameConfig } from "@/config";
import { colors, fontFamily } from "@/components/ui/tokens";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const moment = await getMomentByShareToken(token);

  const chapterName = moment?.chapter_id
    ? gameConfig.chapters[moment.chapter_id]?.name ?? ""
    : "";

  const text = moment?.narrative_text ?? "A moment from the Order of the Gilt Frame.";
  const displayText = text.length > 160 ? text.slice(0, 160) + "..." : text;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: colors.bg,
          padding: "60px",
          gap: "32px",
        }}
      >
        {/* Marker outline */}
        <svg
          viewBox="0 0 40 52"
          width="60"
          height="78"
          style={{ opacity: 0.4 }}
        >
          <rect
            x="0.7" y="0.7" width="38.6" height="50.6" rx="1"
            fill="none" stroke={colors.gold} strokeWidth="1.4"
          />
          <path d="M 12,12 C 12,26 28,22 28,36" fill="none" stroke={colors.gold} strokeWidth="1" />
          <path d="M 28,12 C 28,26 12,22 12,36" fill="none" stroke={colors.gold} strokeWidth="1" />
          <circle cx="18" cy="35" r="1" fill={colors.gold} />
          <circle cx="22" cy="35" r="1" fill={colors.gold} />
          <circle cx="20" cy="32" r="1" fill={colors.gold} />
          <circle cx="20" cy="16" r="1" fill={colors.gold} />
        </svg>

        {chapterName && (
          <p
            style={{
              color: colors.gold50,
              fontSize: "18px",
              fontFamily,
              textTransform: "uppercase",
              letterSpacing: "4px",
            }}
          >
            {chapterName}
          </p>
        )}

        <p
          style={{
            color: colors.gold85,
            fontSize: "28px",
            fontFamily,
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: "900px",
          }}
        >
          {displayText}
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
