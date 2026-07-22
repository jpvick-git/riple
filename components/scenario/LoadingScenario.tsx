"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

const FOUNDATION_MESSAGES = [
  "Finding the point of divergence",
  "Reconstructing the historical conditions",
  "Tracing the first consequences",
  "Building the initial timeline"
];

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
    }, 2200);
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
      <BrandLogo variant="mark" href={null} className="brand-logo-loading spin-soft" />
      <p role="status" aria-live="polite">
        {status}…
      </p>
    </main>
  );
}
