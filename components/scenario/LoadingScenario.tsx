"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { RipleLoader } from "@/components/RipleLoader";

const FOUNDATION_MESSAGES = [
  "Consulting parallel universes",
  "Arguing with historians who don't exist",
  "Bribing the butterfly that started it all",
  "Untangling cause from effect",
  "Asking 'but what happens next?' 400 times",
  "Rerouting the river of history",
  "Checking if this breaks the space-time continuum",
  "Convincing the past to cooperate",
  "Dusting off timelines that never happened",
  "Nudging one domino to see what falls",
  "Politely ignoring the great-person theory",
  "Simulating a few million tiny decisions",
  "Making sure the vibes are historically plausible"
];

const MESSAGE_INTERVAL_MS = 4600;

export function LoadingScenario({
  compact = false,
  message
}: {
  compact?: boolean;
  message?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const statusTimer = window.setInterval(() => {
      setIndex((current) => (current + 1) % FOUNDATION_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => window.clearInterval(statusTimer);
  }, []);

  const status = message || FOUNDATION_MESSAGES[index];

  if (compact) {
    return (
      <div className="generation-status" role="status" aria-live="polite">
        <BrandLogo variant="mark" href={null} className="brand-logo-inline spin-soft" />
        <div className="generation-status-copy">
          <strong>{status}…</strong>
        </div>
      </div>
    );
  }

  return (
    <main className="state-page">
      <RipleLoader className="riple-loader-lg" />
      <p key={status} className="loading-status-text" role="status" aria-live="polite">
        {status}…
      </p>
    </main>
  );
}
