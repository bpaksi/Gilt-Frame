import type { Metadata } from "next";
import ComplianceHeader from "@/components/ui/ComplianceHeader";
import ComplianceFooter from "@/components/ui/ComplianceFooter";

export const metadata: Metadata = {
  title: "Terms and Conditions — Gilt Frame",
  description: "Terms and conditions for the Gilt Frame game application.",
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
            Last updated: March 23, 2026
          </p>

          <div className="mt-10 space-y-10 text-base leading-8 text-gray-700">
            <div>
              <p>
                <strong>Application:</strong> The Order of the Gilt Frame
              </p>
              <p>
                <strong>Operated by:</strong> Robert J Paksi Jr.
              </p>
            </div>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Acceptance of Terms
              </h2>
              <p className="mt-3">
                By registering for or using Gilt Frame, you agree to these
                Terms and Conditions. If you do not agree, please do not use
                our services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Description of Service
              </h2>
              <p className="mt-3">
                The Order of the Gilt Frame is a private, invitation-based
                puzzle game experience. The game involves interactive
                storytelling, puzzle-solving, and location-based activities
                delivered through our website and, optionally, via SMS/MMS
                notifications.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                User Accounts
              </h2>
              <p className="mt-3">
                You may register using your email address. You are responsible
                for providing accurate registration information and for
                maintaining the security of your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                SMS/MMS Notifications
              </h2>
              <p className="mt-3">
                If you opt in to receive SMS/MMS notifications, Gilt Frame will
                send game clues, puzzle updates, and story notifications to the
                phone number you provide. Message and data rates may apply.
              </p>
              <p className="mt-3">
                <strong>Program:</strong> Gilt Frame Game Notifications
              </p>
              <p className="mt-3">
                <strong>Message frequency:</strong> Message frequency varies.
                Up to 10 messages per month.
              </p>
              <p className="mt-3">
                <strong>Opt out:</strong> Reply STOP at any time to stop
                receiving messages. No further messages will be sent unless you
                re-subscribe by replying START.
              </p>
              <p className="mt-3">
                <strong>Help:</strong> Reply HELP to any message for
                assistance, or email{" "}
                <a
                  href="mailto:bpaksi@gmail.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  bpaksi@gmail.com
                </a>
                .
              </p>
              <p className="mt-3">
                SMS opt-in is entirely optional and is not required to
                participate in the game.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Intellectual Property
              </h2>
              <p className="mt-3">
                All content, puzzles, artwork, and narratives associated with
                The Order of the Gilt Frame are the property of the operator
                and may not be reproduced or distributed without permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Limitation of Liability
              </h2>
              <p className="mt-3">
                Gilt Frame is provided as a hobby game experience on an
                &ldquo;as is&rdquo; basis. The operator is not liable for any
                damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Changes to Terms
              </h2>
              <p className="mt-3">
                We may update these terms from time to time. Continued use of
                the service after changes constitutes acceptance of the updated
                terms.
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
