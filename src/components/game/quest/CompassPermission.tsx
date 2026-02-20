"use client";

import MarkerSVG from "../MarkerSVG";

interface CompassPermissionProps {
  onPermission: () => void;
  children: React.ReactNode;
}

export default function CompassPermission({
  onPermission,
  children,
}: CompassPermissionProps) {
  return (
    <button
      onClick={onPermission}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        gap: "32px",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <MarkerSVG size={120} variant="gold" animated />

      <div
        style={{
          color: "rgba(200, 165, 75, 0.7)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "16px",
          fontStyle: "italic",
          textAlign: "center",
          letterSpacing: "3px",
          lineHeight: 1.8,
        }}
      >
        {children}
      </div>
    </button>
  );
}
