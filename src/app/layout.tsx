import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HarborPark • Private Parking in Hong Kong",
  description:
    "Discover and reserve vetted private parking spaces across Hong Kong with live availability, transparent pricing, and trusted hosts.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "HarborPark • Private Parking in Hong Kong",
    description:
      "One map for vetted private parking in Hong Kong. Live data, reservable slots, and community hosts.",
    url: "https://example.com",
    siteName: "HarborPark",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HarborPark • Private Parking in Hong Kong",
    description:
      "Private parking marketplace for Hong Kong drivers with real-time availability.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
