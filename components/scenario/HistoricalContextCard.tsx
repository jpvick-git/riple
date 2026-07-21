import type { HistoricalContext } from "@/lib/types";

export function HistoricalContextCard({ context }: { context: HistoricalContext }) {
  return (
    <div className="sidebar-card">
      <span>Historical context</span>
      <p>{context.overview}</p>

      {context.keyConditions.length > 0 && (
        <div className="sidebar-subblock">
          <h3>Key conditions</h3>
          <ul>
            {context.keyConditions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {context.importantActors.length > 0 && (
        <div className="sidebar-subblock">
          <h3>Important actors</h3>
          <ul>
            {context.importantActors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {context.structuralForces.length > 0 && (
        <div className="sidebar-subblock">
          <h3>Structural forces</h3>
          <ul>
            {context.structuralForces.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
