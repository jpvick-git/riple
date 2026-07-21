export function CoreAssumptionsCard({ assumptions }: { assumptions: string[] }) {
  if (assumptions.length === 0) return null;

  return (
    <div className="sidebar-card">
      <span>Core assumptions</span>
      <ul>
        {assumptions.map((assumption) => (
          <li key={assumption}>{assumption}</li>
        ))}
      </ul>
    </div>
  );
}
