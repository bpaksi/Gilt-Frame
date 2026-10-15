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
        <Link href="/join" className="leading-tight tracking-tight text-gray-900">
          <span className="block text-lg font-bold">Gilt Frame</span>
          <span className="block text-xs font-normal text-gray-500">operated by Robert J Paksi Jr.</span>
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
