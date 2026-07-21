import type { ScenarioSource } from "@/lib/types";

export function SourcesList({ sources }: { sources: ScenarioSource[] }) {
  if (sources.length === 0) {
    return (
      <section className="content-card" aria-labelledby="sources-heading">
        <span className="card-eyebrow">References</span>
        <h2 id="sources-heading">Sources</h2>
        <p className="muted-copy">
          No external sources were attached to this scenario. Historical context may
          still draw on general knowledge; alternate consequences remain speculative.
        </p>
      </section>
    );
  }

  return (
    <section className="content-card" aria-labelledby="sources-heading">
      <span className="card-eyebrow">References</span>
      <h2 id="sources-heading">Sources</h2>
      <ul className="sources-list">
        {sources.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.title}
            </a>
            {source.publisher ? (
              <span className="source-publisher">{source.publisher}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
