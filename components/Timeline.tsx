"use client";

import { useState } from "react";
import { TimelineEventCard } from "@/components/scenario/TimelineEventCard";
import type { ScenarioSource, TimelineEvent } from "@/lib/types";

export function Timeline({
  events,
  sources,
  onOpenEvent,
  onRetryEvent
}: {
  events: TimelineEvent[];
  sources: ScenarioSource[];
  onOpenEvent?: (eventId: string) => void;
  onRetryEvent?: (eventId: string) => void;
}) {
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  return (
    <section className="timeline-section" aria-label="Riple timeline">
      <div className="timeline">
        {events.map((event) => (
          <TimelineEventCard
            key={event.id}
            event={event}
            sources={sources}
            isOpen={openEventId === event.id}
            onToggle={() => {
              setOpenEventId((current) => {
                const next = current === event.id ? null : event.id;
                if (next) onOpenEvent?.(next);
                return next;
              });
            }}
            onRetry={() => onRetryEvent?.(event.id)}
          />
        ))}
      </div>
    </section>
  );
}
