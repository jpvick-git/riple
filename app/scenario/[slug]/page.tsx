"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck, GitBranch, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Timeline } from "@/components/Timeline";
import { AlternateOutcomes } from "@/components/scenario/AlternateOutcomes";
import { FinalWorldState } from "@/components/scenario/FinalWorldState";
import { LoadingScenario } from "@/components/scenario/LoadingScenario";
import { ScenarioError } from "@/components/scenario/ScenarioError";
import { ScenarioHeader } from "@/components/scenario/ScenarioHeader";
import { ScenarioSidebar } from "@/components/scenario/ScenarioSidebar";
import { isRipleSaved, toggleSavedRiple } from "@/lib/savedRiples";
import { useProgressiveScenario } from "@/lib/useProgressiveScenario";

interface ScenarioPageProps {
  params: { slug: string };
}

export default function ScenarioPage({ params }: ScenarioPageProps) {
  const {
    scenario,
    pending,
    missing,
    foundationError,
    deepStatus,
    isDeepening,
    prioritizeEvent,
    retryEvent,
    retryFoundation,
    retryConclusion
  } = useProgressiveScenario(params.slug);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isRipleSaved(params.slug));
  }, [params.slug]);

  async function shareScenario() {
    if (!scenario) return;
    const url = window.location.href;
    const text = `${scenario.title}\n${scenario.prompt}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: scenario.title, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      window.alert("Riple link copied to your clipboard.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        window.alert("Riple link copied to your clipboard.");
      } catch {
        window.alert("Could not share this riple. Copy the page URL from your browser.");
      }
    }
  }

  function handleSaveToggle() {
    if (!scenario) return;
    const result = toggleSavedRiple({
      id: scenario.id,
      title: scenario.title,
      prompt: scenario.prompt,
      summary: scenario.summary,
      depth: scenario.depth
    });
    setSaved(result.saved);
    window.dispatchEvent(new Event("riple:saved-changed"));
  }

  if (missing) {
    return (
      <ScenarioError message="This riple could not be found. It may have expired, or the link may be incomplete. Generate it again from the home page." />
    );
  }

  if (foundationError && !scenario) {
    return (
      <ScenarioError
        message={foundationError}
        prompt={pending?.prompt}
        onRetry={() => void retryFoundation()}
      />
    );
  }

  if (!scenario) {
    return <LoadingScenario />;
  }

  return (
    <main className="scenario-page">
      <nav className="nav-shell scenario-nav">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} /> New riple
        </Link>
        <BrandLogo variant="wordmark" />
        <div className="nav-actions">
          <button
            type="button"
            onClick={handleSaveToggle}
            aria-pressed={saved}
            title={saved ? "Remove from saved riples" : "Save this riple for later"}
          >
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            {saved ? "Saved" : "Save"}
          </button>
          <button type="button" onClick={() => void shareScenario()}>
            <Share2 size={16} /> Share
          </button>
          <button type="button" disabled aria-disabled title="Branch generation is coming soon">
            <GitBranch size={16} /> Branch
          </button>
        </div>
      </nav>

      <div className="scenario-page-shell">
        {isDeepening ? (
          <div className="deep-progress" role="status" aria-live="polite">
            <strong>The Riple is ready</strong>
            <span>
              {deepStatus || "Deeper consequences are still being traced"}…
            </span>
          </div>
        ) : null}

        <section className="scenario-layout">
          <div className="scenario-rail">
            <ScenarioHeader
              title={scenario.title}
              summary={scenario.summary}
            />
            <ScenarioSidebar scenario={scenario} />
          </div>

          <div className="timeline-panel">
            <Timeline
              events={scenario.timeline}
              sources={scenario.sources}
              onOpenEvent={(eventId) => void prioritizeEvent(eventId)}
              onRetryEvent={(eventId) => void retryEvent(eventId)}
            />

            {scenario.generation.conclusion === "loading" ||
            scenario.generation.conclusion === "pending" ? (
              <section className="content-card section-loading">
                <span className="card-eyebrow">Still developing</span>
                <h2>Alternate outcomes & final world state</h2>
                <p className="muted-copy">Testing long-term plausibility…</p>
              </section>
            ) : null}

            {scenario.generation.conclusion === "failed" ? (
              <section className="content-card section-loading">
                <span className="card-eyebrow">Conclusion</span>
                <h2>Could not finish the long-term analysis</h2>
                <button type="button" className="retry-button" onClick={() => void retryConclusion()}>
                  Retry conclusion
                </button>
              </section>
            ) : null}

            {scenario.alternateOutcomes.length > 0 ? (
              <AlternateOutcomes outcomes={scenario.alternateOutcomes} />
            ) : null}
            {scenario.finalState ? (
              <FinalWorldState finalState={scenario.finalState} />
            ) : null}

            <p className="scenario-disclaimer">
              This is an AI-generated thought experiment. Real historical facts are drawn
              from general knowledge, but everything after the change is imagined
              speculation, not a prediction or a record of real events.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
