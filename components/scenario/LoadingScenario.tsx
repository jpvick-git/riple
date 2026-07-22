"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { RipleLoader } from "@/components/RipleLoader";

const FOUNDATION_MESSAGES = [
  "Finding the point of divergence",
  "Reconstructing the historical conditions",
  "Tracing the first consequences",
  "Building the initial timeline"
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
