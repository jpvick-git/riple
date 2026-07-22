import type { HistoricalContext } from "@/lib/types";

export function HistoricalContextCard({ context }: { context: HistoricalContext }) {
  return (
    <div className="sidebar-card">
      <span>The real-world setup</span>
      <p>{context.overview}</p>

      {context.keyConditions.length > 0 && (
        <div className="sidebar-subblock">
          <h3>What was going on</h3>
          <ul>
            {context.keyConditions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {context.importantActors.length > 0 && (
        <div className="sidebar-subblock">
          <h3>Who mattered</h3>
          <ul>
            {context.importantActors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {context.structuralForces.length > 0 && (
        <div className="sidebar-subblock">
          <h3>Bigger pressures</h3>
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
