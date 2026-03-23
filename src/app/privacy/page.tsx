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
            Last updated: March 23, 2026
          </p>

          <div className="mt-10 space-y-10 text-base leading-8 text-gray-700">
            <p>
              Gilt Frame is a private hobby game application (&ldquo;The Order
              of the Gilt Frame&rdquo;) operated by Robert J Paksi Jr. This
              privacy policy describes how we collect, use, and protect your
              information when you use our website and services.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Information We Collect
              </h2>
              <p className="mt-3">
                When you register on our website, we collect your email address
                and, optionally, your name. If you choose to opt in to SMS
                notifications, we also collect your mobile phone number. We
                automatically record your IP address and browser user-agent at
                the time of registration for security and compliance purposes.
              </p>
              <p className="mt-3">
                When you visit our website, our server may collect standard log
                data such as your IP address, browser type, pages visited, and
                timestamps. This data is used solely for site operation and
                security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                How We Use Your Information
              </h2>
              <p className="mt-3">
                Your email address is used to identify your registration and
                may be used to send you game-related updates. Your name, if
                provided, is used to personalize your game experience.
              </p>
              <p className="mt-3">
                If you opted in to SMS notifications, your phone number is used
                solely to send you SMS/MMS game notifications and updates
                related to The Order of the Gilt Frame. Message frequency
                varies; up to 10 messages per month.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Cookies</h2>
              <p className="mt-3">
                Our website does not use advertising or tracking cookies. We
                may use essential cookies required for site functionality, such
                as session management.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Data Sharing
              </h2>
              <p className="mt-3">
                We do not sell, share, or disclose your personal information —
                including your email address, phone number, or any other data —
                to third parties for any purpose, including marketing.
              </p>
              <p className="mt-3">
                No mobile information collected as part of the SMS opt-in
                process — including your phone number and consent data — will
                be shared with or sold to third parties or affiliates for their
                own marketing or promotional purposes. All other categories
                exclude text messaging originator opt-in data and consent; this
                information will not be shared with any third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Data Retention
              </h2>
              <p className="mt-3">
                We retain your registration data for as long as your account is
                active. If you opt out of SMS notifications, your phone number
                and consent records are retained solely for compliance purposes
                and are not used for messaging. You may request deletion of
                your data by contacting us at the email below.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                SMS Opt-Out
              </h2>
              <p className="mt-3">
                You may opt out of receiving SMS messages at any time by
                replying STOP to any message you receive. You may also contact
                us at the email below to be removed. Once you opt out, no
                further messages will be sent unless you re-subscribe by
                replying START.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Data Security
              </h2>
              <p className="mt-3">
                We take reasonable measures to protect your personal
                information from unauthorized access, alteration, or
                destruction. However, no method of electronic transmission or
                storage is completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Changes to This Policy
              </h2>
              <p className="mt-3">
                We may update this privacy policy from time to time. Any
                changes will be reflected on this page with an updated
                &ldquo;Last updated&rdquo; date.
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
