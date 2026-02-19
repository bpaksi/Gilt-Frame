import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Giltframe",
  description: "Privacy policy for the Giltframe game application.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-full bg-white px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-gray-900">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: February 19, 2026
        </p>

        <div className="mt-8 space-y-8 text-base leading-7 text-gray-700">
          <p>
            Giltframe is a private hobby game application operated by Bob Paksi.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Information We Collect
            </h2>
            <p className="mt-2">
              We collect only your mobile phone number when you consent to
              receive game notifications via SMS/MMS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              How We Use Your Information
            </h2>
            <p className="mt-2">
              Your phone number is used solely to send you MMS game
              notifications and updates. We send fewer than 10 messages per
              month.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Data Sharing
            </h2>
            <p className="mt-2">
              We do not sell, share, or disclose your phone number or any
              personal information to third parties for any purpose, including
              marketing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Opt-Out</h2>
            <p className="mt-2">
              You may opt out of receiving messages at any time by replying STOP
              to any message you receive. You may also contact us to be removed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
            <p className="mt-2">
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
      </div>
    </div>
  );
}
