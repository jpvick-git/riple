import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riple — Explore What Happens Next",
  description: "Change one thing and explore the timeline of consequences that follows.",
  icons: {
    icon: [
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: "/brand/icon-180.png", sizes: "180x180", type: "image/png" }]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
