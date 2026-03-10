import Link from "next/link";

const navLinks = [
  { href: "/join", label: "Sign Up" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
];

export default function ComplianceHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          Gilt Frame
        </Link>
        <nav className="flex items-center gap-5 text-sm text-gray-500">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-gray-900"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
