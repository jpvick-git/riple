import type { FinalState } from "@/lib/types";

const LABELS: { key: keyof FinalState; label: string }[] = [
  { key: "politics", label: "Politics" },
  { key: "culture", label: "Culture" },
  { key: "economics", label: "Money & work" },
  { key: "technology", label: "Technology" },
  { key: "dailyLife", label: "Everyday life" },
  { key: "globalEffects", label: "Around the world" }
];

export function FinalWorldState({ finalState }: { finalState: FinalState }) {
  return (
    <section className="content-card" aria-labelledby="final-state-heading">
      <span className="card-eyebrow">Where it lands</span>
      <h2 id="final-state-heading">How this world ends up</h2>
      <div className="final-state-grid">
        {LABELS.map(({ key, label }) => (
          <article key={key} className="final-state-item">
            <h3>{label}</h3>
            <p>{finalState[key]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
