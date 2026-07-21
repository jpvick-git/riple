import type { PlausibilityLabel } from "@/lib/types";

export function ConfidenceBadge({
  score,
  label,
  reason
}: {
  score: number;
  label: PlausibilityLabel;
  reason?: string;
}) {
  return (
    <span
      className={`confidence-badge confidence-${label.toLowerCase()}`}
      title={reason}
    >
      {label} · {score}%
    </span>
  );
}
