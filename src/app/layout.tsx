import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "INVINCIBLE PROS | Bespoke Product Engineering Guild",
  description:
    "We design and build clean, high-utility digital architecture. Engineered with absolute purpose and execution speed.",
  metadataBase: new URL("https://invincible-pros.vercel.app"),
  openGraph: {
    title: "INVINCIBLE PROS | Digital Ecosystems, Realized.",
    description:
      "Handcrafted digital solutions compiled cleanly for distributed cloud topographies, AI synapses, and enterprise grids.",
    type: "website",
  },
};

import Navigation from "@/components/ui/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-accent antialiased selection:bg-accent selection:text-background">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
