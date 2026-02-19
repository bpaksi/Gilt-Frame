import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions — Giltframe",
  description: "Terms and conditions for the Giltframe game notifications.",
};

export default function TermsPage() {
  return (
    <div className="min-h-full bg-white px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-gray-900">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: February 19, 2026
        </p>

        <div className="mt-8 space-y-8 text-base leading-7 text-gray-700">
          <div>
            <p>
              <strong>Program:</strong> Giltframe Game Notifications
            </p>
            <p>
              <strong>Operated by:</strong> Bob Paksi
            </p>
          </div>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Description
            </h2>
            <p className="mt-2">
              Giltframe sends MMS game notifications and updates to a small
              private group of consenting participants.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Message Frequency
            </h2>
            <p className="mt-2">Fewer than 10 MMS messages per month.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Message &amp; Data Rates
            </h2>
            <p className="mt-2">
              Message and data rates may apply. Contact your wireless carrier
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              How to Get Help
            </h2>
            <p className="mt-2">
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
            <p className="mt-2">
              Reply STOP at any time to stop receiving messages. You will
              receive a confirmation and no further messages will be sent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
            <p className="mt-2">
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
