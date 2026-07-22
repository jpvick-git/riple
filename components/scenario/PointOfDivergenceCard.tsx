import type { PointOfDivergence } from "@/lib/types";

export function PointOfDivergenceCard({ point }: { point: PointOfDivergence }) {
  return (
    <div className="sidebar-card">
      <span>The change</span>
      <h2>{point.title}</h2>
      <strong className="sidebar-date">{point.date}</strong>
      <p>{point.description}</p>
      <div className="sidebar-subblock">
        <h3>Why this moment</h3>
        <p>{point.whyThisDate}</p>
      </div>
      <div className="sidebar-subblock">
        <h3>What changes right away</h3>
        <p>{point.immediateChange}</p>
      </div>
    </div>
  );
}
