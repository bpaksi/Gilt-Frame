import Link from "next/link";
import { getAdminTrack } from "@/lib/admin/track";
import FreeformCompose from "@/components/admin/FreeformCompose";

export default async function SendHintPage() {
  const track = await getAdminTrack();

  return (
    <div style={{ padding: "16px" }}>
      <Link
        href="/the-order/current"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "13px",
          color: "#336699",
          textDecoration: "none",
          marginBottom: "12px",
          fontWeight: 500,
        }}
      >
        &larr; Back to Current
      </Link>
      <FreeformCompose track={track} />
    </div>
  );
}
