"use client";

import MarkerSVG from "../MarkerSVG";

interface CompassPermissionProps {
  onPermission: () => void;
  label: string;
  showMarker?: boolean;
  description?: string;
}

export default function CompassPermission({
  onPermission,
  label,
  showMarker = false,
  description,
}: CompassPermissionProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        flex: 1,
        gap: "32px",
        padding: "40px 24px",
      }}
    >
      {showMarker && <MarkerSVG size={48} variant="gold" animated />}

      {description && (
        <p
          style={{
            color: "rgba(200, 165, 75, 0.6)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "16px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.8,
          }}
        >
          {description}
        </p>
      )}

      <button
        onClick={onPermission}
        style={{
          background: "none",
          border: "1px solid rgba(200, 165, 75, 0.3)",
          color: "rgba(200, 165, 75, 0.8)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "16px",
          fontStyle: "italic",
          letterSpacing: "2px",
          padding: "14px 32px",
          cursor: "pointer",
          minHeight: "44px",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {label}
      </button>
    </div>
  );
}
