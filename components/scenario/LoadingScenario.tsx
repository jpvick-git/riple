"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

const FOUNDATION_MESSAGES = [
  "Finding the point of divergence",
  "Reconstructing the historical conditions",
  "Tracing the first consequences",
  "Building the initial timeline"
];

function formatElapsed(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export function LoadingScenario({
  compact = false,
  message
}: {
  compact?: boolean;
  message?: string;
}) {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const statusTimer = window.setInterval(() => {
      setIndex((current) => (current + 1) % FOUNDATION_MESSAGES.length);
    }, 2200);
    const elapsedTimer = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);
    return () => {
      window.clearInterval(statusTimer);
      window.clearInterval(elapsedTimer);
    };
  }, []);

  const status = message || FOUNDATION_MESSAGES[index];

  if (compact) {
    return (
      <div className="generation-status" role="status" aria-live="polite">
        <LoaderCircle className="spin" size={16} aria-hidden="true" />
        <div className="generation-status-copy">
          <strong>{status}…</strong>
          <span>Elapsed: {formatElapsed(elapsed)}</span>
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
        The first timeline usually appears within about 10 seconds. Elapsed:{" "}
        {formatElapsed(elapsed)}
      </p>
    </main>
  );
}
