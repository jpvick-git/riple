"use client";

import { ChevronDown, LoaderCircle } from "lucide-react";
import { ConfidenceBadge } from "@/components/scenario/ConfidenceBadge";
import { EventDetailsPanel } from "@/components/scenario/EventDetails";
import type { ScenarioSource, TimelineEvent } from "@/lib/types";

/** Set true to restore expandable deep-detail panels on timeline cards. */
const SHOW_EVENT_DETAILS = false;

export function TimelineEventCard({
  event,
  isOpen,
  onToggle,
  onRetry,
  sources
}: {
  event: TimelineEvent;
  isOpen: boolean;
  onToggle: () => void;
  onRetry?: () => void;
  sources: ScenarioSource[];
}) {
  const panelId = `event-panel-${event.id}`;
  const buttonId = `event-toggle-${event.id}`;
  const detailsOpen = SHOW_EVENT_DETAILS && isOpen;

  const meta = (
    <div className="event-header-copy">
      <div className="event-meta-row">
        <span className="category-badge">{event.category}</span>
        <ConfidenceBadge
          score={event.confidence.score}
          label={event.confidence.label}
          reason={event.confidence.reason}
        />
        {SHOW_EVENT_DETAILS && event.detailState === "loading" ? (
          <span className="detail-state-chip">Tracing…</span>
        ) : null}
        {SHOW_EVENT_DETAILS && event.detailState === "ready" ? (
          <span className="detail-state-chip ready">Details ready</span>
        ) : null}
      </div>
      <h3>{event.title}</h3>
      <p>{event.summary}</p>
    </div>
  );

  return (
    <article className="timeline-item">
      <div className="timeline-year">
        <span className="timeline-date">{event.date}</span>
        <span className="timeline-era">{event.era}</span>
      </div>
      <div className="timeline-rail" aria-hidden="true">
        <span className="timeline-marker" />
      </div>
      <div className="event-card">
        {SHOW_EVENT_DETAILS ? (
          <button
            id={buttonId}
            type="button"
            className="event-header"
            onClick={onToggle}
            aria-expanded={detailsOpen}
            aria-controls={panelId}
          >
            {meta}
            <ChevronDown
              className={detailsOpen ? "rotate" : ""}
              aria-hidden="true"
              size={20}
            />
            <span className="sr-only">
              {detailsOpen ? "Collapse details" : "Expand details"}
            </span>
          </button>
        ) : (
          <div className="event-header event-header-static">{meta}</div>
        )}

        {detailsOpen ? (
          <div id={panelId} role="region" aria-labelledby={buttonId}>
            {event.detailState === "ready" && event.details ? (
              <EventDetailsPanel
                details={event.details}
                toneNote={event.toneNote}
                sourceRefs={event.sourceRefs}
                sources={sources}
              />
            ) : event.detailState === "failed" ? (
              <div className="event-details detail-status">
                <p>Deep analysis failed for this event.</p>
                <button type="button" className="retry-button" onClick={onRetry}>
                  Retry details
                </button>
              </div>
            ) : (
              <div className="event-details detail-status" role="status">
                <LoaderCircle className="spin" size={16} aria-hidden="true" />
                <p>Tracing the deeper consequences…</p>
                <div className="detail-skeleton" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
