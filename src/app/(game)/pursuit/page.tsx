import type { Metadata } from "next";
import WaitingState from "@/components/game/WaitingState";
import QuestRunner from "./QuestRunner";
import { getQuestState } from "@/lib/actions/quest";

export const metadata: Metadata = {
  title: "Pursuit | The Order of the Gilt Frame",
};

export default async function CurrentPage() {
  const questState = await getQuestState();

  if (questState.status !== "active") {
    return <WaitingState message={"The Order will contact you\nwhen ready."} />;
  }

  return <QuestRunner initialState={questState} />;
}
