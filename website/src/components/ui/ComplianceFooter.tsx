import Link from "next/link";

const links = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
];

export default function ComplianceFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
      <nav className="flex items-center justify-center gap-4">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="hover:text-gray-600 transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
      <p className="mt-3">&copy; {new Date().getFullYear()} Gilt Frame &mdash; operated by Robert J Paksi Jr.</p>
    </footer>
  );
}
