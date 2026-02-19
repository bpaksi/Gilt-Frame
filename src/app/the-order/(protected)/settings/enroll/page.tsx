import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import EnrollmentClient from "./EnrollmentClient";

export default async function EnrollmentPage() {
  const supabase = createAdminClient();
  const { data: enrollments } = await supabase
    .from("device_enrollments")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={{ padding: "40px 24px", maxWidth: "720px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "32px" }}>
        <Link
          href="/the-order/settings"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "14px",
            color: "#888",
            textDecoration: "none",
            letterSpacing: "1px",
          }}
        >
          ← Settings
        </Link>
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "20px",
            fontWeight: 400,
            letterSpacing: "2px",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Device Enrollment
        </h1>
      </div>

      <EnrollmentClient initialEnrollments={enrollments ?? []} />
    </div>
  );
}
