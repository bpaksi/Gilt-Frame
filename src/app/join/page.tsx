import type { Metadata } from "next";
import ComplianceHeader from "@/components/ui/ComplianceHeader";
import ComplianceFooter from "@/components/ui/ComplianceFooter";
import JoinForm from "./_components/JoinForm";

export const metadata: Metadata = {
  title: "Join | The Order of the Gilt Frame",
  description:
    "Register to join The Order of the Gilt Frame — an immersive puzzle game experience.",
};

export default function JoinPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <ComplianceHeader />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Join Gilt Frame
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Register to join The Order of the Gilt Frame — an immersive
              puzzle game experience. You may also opt in to receive SMS
              puzzle clues and game updates.
            </p>
          </div>

          <div className="mt-10">
            <JoinForm />
          </div>
        </div>
      </main>

      <div className="mx-auto w-full max-w-md px-6">
        <ComplianceFooter />
      </div>
    </div>
  );
}
