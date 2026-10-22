import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { project } from "@/content/project";
import { getImage, pickSource } from "@/lib/media";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const ogImage = pickSource(getImage(project.hero.image), 1600);

export const metadata: Metadata = {
  // Set SITE_URL at build time so link previews (WhatsApp, Slack, email) get an absolute image URL
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: `${project.name} | ${project.studio}`,
  description: project.tagline,
  openGraph: {
    title: project.name,
    description: project.tagline,
    images: [{ url: ogImage.src, width: ogImage.width, height: ogImage.height }],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f0e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <body>{children}</body>
    </html>
  );
}
