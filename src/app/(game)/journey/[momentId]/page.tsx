import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveTrack } from "@/lib/track";
import { getMomentById } from "@/lib/actions/moments";
import { gameConfig } from "@/config";
import MomentDetail from "@/components/game/MomentDetail";

export const metadata: Metadata = {
  title: "Moment | The Order of the Gilt Frame",
};

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

  const chapterName = moment.chapter_id
    ? gameConfig.chapters[moment.chapter_id]?.name
    : undefined;

  return <MomentDetail moment={moment} chapterName={chapterName} />;
}
