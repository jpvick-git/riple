"use client";

import Link from "next/link";
import { ArrowLeft, GitBranch, Share2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Timeline } from "@/components/Timeline";
import { AlternateOutcomes } from "@/components/scenario/AlternateOutcomes";
import { FinalWorldState } from "@/components/scenario/FinalWorldState";
import { LoadingScenario } from "@/components/scenario/LoadingScenario";
import { ScenarioError } from "@/components/scenario/ScenarioError";
import { ScenarioHeader } from "@/components/scenario/ScenarioHeader";
import { ScenarioSidebar } from "@/components/scenario/ScenarioSidebar";
import { SourcesList } from "@/components/scenario/SourcesList";
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

  async function shareScenario() {
    if (!scenario) return;
    const text = `${scenario.title}\n${scenario.prompt}`;
    if (navigator.share) {
      await navigator.share({ title: scenario.title, text });
    } else {
      await navigator.clipboard.writeText(text);
      window.alert("Scenario summary copied to your clipboard.");
    }
  }

  if (missing) {
    return (
      <ScenarioError message="This riple is no longer in this browser session. Generate it again from the home page." />
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
          <button type="button" onClick={shareScenario}>
            <Share2 size={16} /> Share
          </button>
          <button type="button" title="Branch generation is the next feature">
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
            {scenario.generation.sources === "complete" || scenario.sources.length > 0 ? (
              <SourcesList sources={scenario.sources} />
            ) : scenario.generation.sources === "loading" ? (
              <section className="content-card section-loading">
                <span className="card-eyebrow">References</span>
                <h2>Sources</h2>
                <p className="muted-copy">Gathering references…</p>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
