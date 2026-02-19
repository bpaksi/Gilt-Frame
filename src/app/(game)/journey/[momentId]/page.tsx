import { notFound } from "next/navigation";
import { resolveTrack } from "@/lib/track";
import { getMomentById } from "@/lib/actions/moments";
import MomentDetail from "@/components/game/MomentDetail";

export default async function MomentDetailPage({
  params,
}: {
  params: Promise<{ momentId: string }>;
}) {
  const { momentId } = await params;
  const trackInfo = await resolveTrack();
  if (!trackInfo) notFound();

  const moment = await getMomentById(momentId, trackInfo.track);
  if (!moment) notFound();

  return <MomentDetail moment={moment} />;
}
