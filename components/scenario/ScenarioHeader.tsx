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
      <h1>Riple Timeline</h1>
      <p className="scenario-title-line">{title}</p>
      <p className="question">{prompt}</p>
      <p className="summary">{summary}</p>
      <p className="disclaimer-note">
        Real history is grounded in available sources. The what-if parts are educated
        guesses, not documented events.
      </p>
    </header>
  );
}
