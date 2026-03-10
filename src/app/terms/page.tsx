import type { Metadata } from "next";
import ComplianceHeader from "@/components/ui/ComplianceHeader";
import ComplianceFooter from "@/components/ui/ComplianceFooter";

export const metadata: Metadata = {
  title: "Terms and Conditions — Gilt Frame",
  description: "Terms and conditions for the Gilt Frame game notifications.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <ComplianceHeader />

      <main className="flex-1 px-8 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-xl text-gray-900">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Last updated: March 10, 2026
          </p>

          <div className="mt-10 space-y-10 text-base leading-8 text-gray-700">
            <div>
              <p>
                <strong>Program:</strong> Gilt Frame Game Notifications
              </p>
              <p>
                <strong>Operated by:</strong> Bob Paksi
              </p>
            </div>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
              <p className="mt-3">
                Gilt Frame sends SMS/MMS game notifications and updates to a small
                private group of consenting participants.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Message Frequency
              </h2>
              <p className="mt-3">
                Message frequency varies. Up to 10 messages per month.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Message &amp; Data Rates
              </h2>
              <p className="mt-3">
                Message and data rates may apply. Contact your wireless carrier
                for details.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                How to Get Help
              </h2>
              <p className="mt-3">
                Reply HELP to any message for assistance, or email{" "}
                <a
                  href="mailto:bpaksi@gmail.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  bpaksi@gmail.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                How to Opt Out
              </h2>
              <p className="mt-3">
                Reply STOP at any time to stop receiving messages. No further
                messages will be sent unless you re-subscribe by replying START.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
              <p className="mt-3">
                <a
                  href="mailto:bpaksi@gmail.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  bpaksi@gmail.com
                </a>
              </p>
            </section>
          </div>

          <ComplianceFooter />
        </div>
      </main>
    </div>
  );
}
