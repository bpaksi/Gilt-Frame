"use client";

import { useRouter } from "next/navigation";
import LandingPage from "../../../../components/game/LandingPage";

export default function BeginningPage() {
  const router = useRouter();

  return (
    <LandingPage
      hasDeviceToken={false}
      isReplay={true}
      onReplayEnd={() => router.push("/journey")}
    />
  );
}
