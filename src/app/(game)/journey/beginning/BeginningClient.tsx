"use client";

import { useRouter } from "next/navigation";
import IntroPage from "../../../../components/game/IntroPage";

export default function BeginningClient() {
  const router = useRouter();

  return (
    <IntroPage
      isReplay={true}
      onComplete={() => router.push("/journey")}
    />
  );
}
