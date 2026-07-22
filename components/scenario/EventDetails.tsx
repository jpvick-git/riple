import type { EventDetails, ScenarioSource } from "@/lib/types";

export function EventDetailsPanel({
  details,
  toneNote,
  sourceRefs,
  sources
}: {
  details: EventDetails;
  toneNote: string | null;
  sourceRefs: string[];
  sources: ScenarioSource[];
}) {
  const linkedSources = sources.filter((source) => sourceRefs.includes(source.id));

  return (
    <div className="event-details">
      <section className="detail-block">
        <h4>What happens first</h4>
        <p>{details.directConsequence}</p>
      </section>

      <section className="detail-block">
        <h4>Who reacts</h4>
        <p>{details.institutionalResponse}</p>
      </section>

      {details.secondOrderEffects.length > 0 && (
        <section className="detail-block">
          <h4>What follows</h4>
          <ul>
            {details.secondOrderEffects.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="detail-columns">
        {details.winners.length > 0 && (
          <section className="detail-block">
            <h4>Winners</h4>
            <ul>
              {details.winners.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}
        {details.losers.length > 0 && (
          <section className="detail-block">
            <h4>Losers</h4>
            <ul>
              {details.losers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {details.whatRemainsUnchanged.length > 0 && (
        <section className="detail-block">
          <h4>What stays the same</h4>
          <ul>
            {details.whatRemainsUnchanged.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {details.uncertainties.length > 0 && (
        <section className="detail-block">
          <h4>What&apos;s unclear</h4>
          <ul>
            {details.uncertainties.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="detail-block">
        <h4>Why this makes sense</h4>
        <p>{details.historicalLogic}</p>
      </section>

      {toneNote && (
        <p className="tone-note">{toneNote}</p>
      )}

      {linkedSources.length > 0 && (
        <section className="detail-block">
          <h4>Sources used</h4>
          <ul className="inline-source-list">
            {linkedSources.map((source) => (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>
                {source.publisher ? ` — ${source.publisher}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
