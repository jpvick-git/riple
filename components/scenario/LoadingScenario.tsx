"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

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
        <LoaderCircle className="spin" size={16} aria-hidden="true" />
        <div className="generation-status-copy">
          <strong>{status}…</strong>
        </div>
      </div>
    );
  }

  return (
    <main className="state-page">
      <LoaderCircle className="spin" size={34} aria-hidden="true" />
      <p role="status" aria-live="polite">
        {status}…
      </p>
      <p className="muted-copy">
        The first timeline usually appears within about 10 seconds.
      </p>
    </main>
  );
}
