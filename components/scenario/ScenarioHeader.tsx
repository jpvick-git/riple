export function ScenarioHeader({
  title,
  prompt,
  summary
}: {
  title: string;
  prompt: string;
  summary: string;
}) {
  return (
    <header className="scenario-hero">
      <div className="eyebrow">Generated consequences</div>
      <h1>Ripple Timeline</h1>
      <p className="scenario-title-line">{title}</p>
      <p className="question">{prompt}</p>
      <p className="summary">{summary}</p>
      <p className="disclaimer-note">
        Historical facts are grounded in available sources. Alternate consequences are
        reasoned projections, not documented events.
      </p>
    </header>
  );
}
