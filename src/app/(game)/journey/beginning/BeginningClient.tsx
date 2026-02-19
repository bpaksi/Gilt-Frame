"use client";

import { useRouter } from "next/navigation";
import LandingPage from "../../../../components/game/LandingPage";

export default function BeginningClient() {
  const router = useRouter();

  return (
    <LandingPage
      isReplay={true}
      onReplayEnd={() => router.push("/journey")}
    />
  );
}
