import WaitingState from "@/components/game/WaitingState";
import QuestStateMachine from "@/components/game/quest/QuestStateMachine";
import { getQuestState } from "@/lib/actions/quest";

export default async function CurrentPage() {
  const questState = await getQuestState();

  if (questState.status !== "active") {
    return <WaitingState />;
  }

  return <QuestStateMachine initialState={questState} />;
}
