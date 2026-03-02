import type { Metadata } from "next";
import { colors } from "@/components/ui/tokens";
import JoinForm from "./_components/JoinForm";

export const metadata: Metadata = {
  title: "Join | The Order of the Gilt Frame",
  description:
    "Sign up for SMS puzzle clues and game updates from The Order of the Gilt Frame.",
};

export default function JoinPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: colors.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <JoinForm />
    </main>
  );
}
