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
    <div className="p-4 md:py-10 md:px-6 max-w-3xl">
      <div className="flex items-baseline gap-4 mb-8">
        <Link
          href="/the-order/settings"
          className="font-sans text-sm text-admin-text-faint no-underline tracking-[1px] transition-colors hover:text-admin-blue"
        >
          ← Settings
        </Link>
        <h1 className="font-sans text-xl font-normal tracking-[2px] uppercase m-0">
          Device Enrollment
        </h1>
      </div>

      <EnrollmentClient initialEnrollments={enrollments ?? []} />
    </div>
  );
}
