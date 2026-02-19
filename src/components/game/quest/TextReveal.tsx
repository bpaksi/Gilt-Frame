"use client";

interface TextRevealProps {
  lines: string[];
  delayBetween?: number;
  baseDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  lineStyle?: React.CSSProperties;
}

export default function TextReveal({
  lines,
  delayBetween = 600,
  baseDelay = 0,
  style,
  lineStyle,
}: TextRevealProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", ...style }}>
      {lines.map((line, i) => (
        <p
          key={`${i}-${line}`}
          style={{
            opacity: 0,
            animation: `fade-in 0.8s ease forwards`,
            animationDelay: `${baseDelay + i * delayBetween}ms`,
            color: "rgba(200, 165, 75, 0.9)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "18px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.8,
            letterSpacing: "0.5px",
            ...lineStyle,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
