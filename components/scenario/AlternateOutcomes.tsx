import type { AlternateOutcome } from "@/lib/types";

export function AlternateOutcomes({ outcomes }: { outcomes: AlternateOutcome[] }) {
  if (outcomes.length === 0) return null;

  return (
    <section className="content-card" aria-labelledby="alternate-outcomes-heading">
      <span className="card-eyebrow">Branching possibilities</span>
      <h2 id="alternate-outcomes-heading">Alternate outcomes</h2>
      <div className="outcome-grid">
        {outcomes.map((outcome) => (
          <article key={outcome.title} className="outcome-card">
            <span className="probability-badge">{outcome.probability}</span>
            <h3>{outcome.title}</h3>
            <p>{outcome.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
