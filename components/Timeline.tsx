"use client";

import { useMemo, useState } from "react";
import { TimelineEventCard } from "@/components/scenario/TimelineEventCard";
import { TimelineFilters } from "@/components/scenario/TimelineFilters";
import type { EventCategory, ScenarioSource, TimelineEvent } from "@/lib/types";

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
  const categories = useMemo(
    () => Array.from(new Set(events.map((event) => event.category))),
    [events]
  );
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  const filtered =
    selectedCategory === "All"
      ? events
      : events.filter((event) => event.category === selectedCategory);

  return (
    <section className="timeline-section" aria-label="Riple timeline">
      <TimelineFilters
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {filtered.length === 0 ? (
        <div className="empty-filter-state" role="status">
          No events in this category. Choose another filter to continue the timeline.
        </div>
      ) : (
        <div className="timeline">
          {filtered.map((event) => (
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
      )}
    </section>
  );
}
