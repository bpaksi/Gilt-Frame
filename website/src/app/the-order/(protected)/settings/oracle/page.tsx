import Link from "next/link";
import OracleReview from "@/components/admin/settings/OracleReview";

export default function OracleSettingsPage() {
  return (
    <div className="p-4 max-w-3xl">
      <div className="flex items-baseline gap-4 mb-6">
        <Link
          href="/the-order/settings"
          className="font-sans text-sm text-admin-text-faint no-underline tracking-[1px] transition-colors hover:text-admin-blue"
        >
          ← Settings
        </Link>
        <div className="text-[11px] font-semibold tracking-[1.5px] uppercase text-admin-text-muted">
          AI Chat Review
        </div>
      </div>
      <OracleReview />
    </div>
  );
}
