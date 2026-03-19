import type { Metadata } from "next";
import ComplianceHeader from "@/components/ui/ComplianceHeader";
import ComplianceFooter from "@/components/ui/ComplianceFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — Gilt Frame",
  description: "Privacy policy for the Gilt Frame game application.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <ComplianceHeader />

      <main className="flex-1 px-8 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-xl text-gray-900">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Last updated: March 10, 2026
          </p>

          <div className="mt-10 space-y-10 text-base leading-8 text-gray-700">
            <p>
              Gilt Frame is a private hobby game application operated by
              Robert J Paksi Jr.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Information We Collect
              </h2>
              <p className="mt-3">
                When you opt in to receive game notifications, we collect your
                mobile phone number and, optionally, your name. We also
                automatically record your IP address and browser user-agent at the
                time of consent for compliance record-keeping.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                How We Use Your Information
              </h2>
              <p className="mt-3">
                Your phone number is used solely to send you SMS/MMS game
                notifications and updates related to The Order of the Gilt Frame.
                Message frequency varies; up to 10 messages per month. Your IP
                address and user-agent are stored only as proof of consent and are
                not used for any other purpose.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Data Sharing
              </h2>
              <p className="mt-3">
                We do not sell, share, or disclose your phone number or any
                personal information to third parties for any purpose, including
                marketing. No mobile information collected as part of the SMS
                opt-in process — including your phone number and consent data —
                will be shared with or sold to third parties or affiliates for
                their own marketing or promotional purposes. All other
                categories exclude text messaging originator opt-in data and
                consent; this information will not be shared with any third
                parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Opt-Out</h2>
              <p className="mt-3">
                You may opt out of receiving messages at any time by replying STOP
                to any message you receive. You may also contact us at the email
                below to be removed. Once you opt out, no further messages will be
                sent unless you re-subscribe by replying START.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
              <p className="mt-3">
                For questions about this policy, contact:{" "}
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
