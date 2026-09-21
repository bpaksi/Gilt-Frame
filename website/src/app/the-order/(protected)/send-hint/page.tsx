import Link from "next/link";
import { getAdminTrack } from "@/lib/admin/track";
import FreeformCompose from "@/components/admin/FreeformCompose";

export default async function SendHintPage() {
  const track = await getAdminTrack();

  return (
    <div className="p-4">
      <Link
        href="/the-order/current"
        className="inline-flex items-center gap-1 text-[13px] text-admin-blue no-underline mb-3 font-medium transition-opacity hover:opacity-70"
      >
        &larr; Back to Current
      </Link>
      <FreeformCompose track={track} />
    </div>
  );
}
