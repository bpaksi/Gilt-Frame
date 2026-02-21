import Link from "next/link";
import MomentsManager from "@/components/admin/settings/MomentsManager";

export default function MomentsSettingsPage() {
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
          Snapshots
        </div>
      </div>
      <MomentsManager />
    </div>
  );
}
