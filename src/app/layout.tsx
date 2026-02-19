import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Order of the Gilt Frame",
  description: "An immersive location-based experience.",
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
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}
