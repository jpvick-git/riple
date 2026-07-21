import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riple — Explore What Happens Next",
  description: "Change one thing and explore the timeline of consequences that follows."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
