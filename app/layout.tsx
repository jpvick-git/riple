import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://riple.me";
const title = "Riple — Explore What Happens Next";
const description =
  "Change one thing and explore the timeline of consequences that follows. Ask a serious, personal, or absurd what-if and follow every riple.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Riple"
  },
  description,
  applicationName: "Riple",
  keywords: ["what if", "alternate history", "timeline", "consequences", "scenario explorer"],
  authors: [{ name: "Riple" }],
  creator: "Riple",
  icons: {
    icon: [
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: "/brand/icon-180.png", sizes: "180x180", type: "image/png" }]
  },
  formatDetection: {
    telephone: false
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Riple",
    title,
    description
  },
  twitter: {
    card: "summary_large_image",
    title,
    description
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07090f" },
    { media: "(prefers-color-scheme: light)", color: "#07090f" }
  ],
  colorScheme: "dark"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
