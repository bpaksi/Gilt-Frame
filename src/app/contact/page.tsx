import type { Metadata } from "next";
import ComplianceHeader from "@/components/ui/ComplianceHeader";
import ComplianceFooter from "@/components/ui/ComplianceFooter";

export const metadata: Metadata = {
  title: "Contact — Gilt Frame",
  description: "Contact information for the Gilt Frame game application.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <ComplianceHeader />

      <main className="flex-1 px-8 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-xl text-gray-900">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Contact Us
          </h1>

          <div className="mt-10 space-y-10 text-base leading-8 text-gray-700">
            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                General Inquiries
              </h2>
              <p className="mt-3">
                For questions about The Order of the Gilt Frame, messaging, or
                this website, please email:{" "}
                <a
                  href="mailto:bpaksi@gmail.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  bpaksi@gmail.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                SMS Support
              </h2>
              <p className="mt-3">
                If you are receiving text messages and need help, reply HELP to any
                message. To stop receiving messages, reply STOP. You can also email
                us at the address above to be removed from the messaging program.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Operated By
              </h2>
              <p className="mt-3">
                Gilt Frame is a private hobby game application operated by Bob
                Paksi. We typically respond to inquiries within 48 hours.
              </p>
            </section>
          </div>

          <ComplianceFooter />
        </div>
      </main>
    </div>
  );
}
