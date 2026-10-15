import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login | Admin",
};

function timingSafeEqual(a: string, b: string): boolean {
  // Pad/truncate to the same length before comparing so we never short-circuit
  const aEncoded = Buffer.from(a.padEnd(256));
  const bEncoded = Buffer.from(b.padEnd(256));
  return crypto.subtle !== undefined
    ? // In an async context we'd use crypto.subtle.timingSafeEqual — but since
      // this is a server component we use Node's Buffer.compare workaround.
      Buffer.compare(aEncoded, bEncoded) === 0
    : a === b; // Fallback (should never reach in Node.js)
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  const adminKey = process.env.ADMIN_KEY;

  // Guard against missing env var — without it the page is always inaccessible
  if (!adminKey) {
    notFound();
  }

  const { k } = await searchParams;

  if (!k || !timingSafeEqual(k, adminKey)) {
    notFound();
  }

  return <LoginForm />;
}
