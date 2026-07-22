import { ConfidenceBadge } from "@/components/scenario/ConfidenceBadge";
import type { Plausibility } from "@/lib/types";

export function PlausibilityCard({ plausibility }: { plausibility: Plausibility }) {
  return (
    <div className="sidebar-card">
      <span>How believable is this?</span>
      <div className="plausibility-header">
        <ConfidenceBadge score={plausibility.score} label={plausibility.label} />
      </div>
      <p>{plausibility.explanation}</p>
    </div>
  );
}
