import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://giltframe.org"
  ),
  title: "The Order of the Gilt Frame",
  description: "An immersive location-based experience.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "The Order of the Gilt Frame",
    description: "An immersive location-based experience.",
    images: ["/og-default.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <html lang="en" className="h-full">
      <head>
        {supabaseUrl && <link rel="preconnect" href={supabaseUrl} />}
      </head>
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}
