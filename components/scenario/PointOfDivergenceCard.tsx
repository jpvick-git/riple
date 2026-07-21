import type { PointOfDivergence } from "@/lib/types";

export function PointOfDivergenceCard({ point }: { point: PointOfDivergence }) {
  return (
    <div className="sidebar-card">
      <span>Point of divergence</span>
      <h2>{point.title}</h2>
      <strong className="sidebar-date">{point.date}</strong>
      <p>{point.description}</p>
      <div className="sidebar-subblock">
        <h3>Why this date</h3>
        <p>{point.whyThisDate}</p>
      </div>
      <div className="sidebar-subblock">
        <h3>Immediate change</h3>
        <p>{point.immediateChange}</p>
      </div>
    </div>
  );
}
