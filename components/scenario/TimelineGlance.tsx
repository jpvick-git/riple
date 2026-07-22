import { ConfidenceBadge } from "@/components/scenario/ConfidenceBadge";
import type { Scenario } from "@/lib/types";

export function TimelineGlance({ scenario }: { scenario: Scenario }) {
  const first = scenario.timeline[0];
  const last = scenario.timeline[scenario.timeline.length - 1];
  const span =
    first && last
      ? first.date === last.date
        ? first.date
        : `${first.date} → ${last.date}`
      : null;

  return (
    <section className="timeline-glance" aria-label="Timeline overview">
      <header className="glance-head">
        <span className="glance-eyebrow">Overview</span>
        <ConfidenceBadge
          score={scenario.plausibility.score}
          label={scenario.plausibility.label}
          reason={scenario.plausibility.explanation}
        />
      </header>

      <div className="glance-stats">
        <div className="glance-item">
          <span className="glance-label">Events</span>
          <strong className="glance-value">{scenario.timeline.length}</strong>
        </div>
        {span ? (
          <div className="glance-item">
            <span className="glance-label">Spans</span>
            <strong className="glance-value glance-span">{span}</strong>
          </div>
        ) : null}
      </div>

      <div className="glance-change">
        <span className="glance-label">The change</span>
        <strong className="glance-change-date">{scenario.pointOfDivergence.date}</strong>
        <p>{scenario.pointOfDivergence.title}</p>
      </div>
    </section>
  );
}
