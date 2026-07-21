import type {
  EventDetailPayload,
  Scenario,
  ScenarioConclusion,
  ScenarioSource,
  SectionStatus
} from "@/lib/types";

export function mergeEventDetails(
  scenario: Scenario,
  details: EventDetailPayload[],
  status: SectionStatus = "complete"
): Scenario {
  const byId = new Map(details.map((item) => [item.eventId, item]));
  const eventDetails = { ...scenario.generation.eventDetails };

  const timeline = scenario.timeline.map((event) => {
    const incoming = byId.get(event.id);
    if (!incoming?.details) return event;

    eventDetails[event.id] = status;
    return {
      ...event,
      details: incoming.details,
      toneNote: incoming.toneNote,
      sourceRefs: incoming.sourceRefs ?? [],
      detailState: status === "complete" ? ("ready" as const) : event.detailState
    };
  });

  return {
    ...scenario,
    timeline,
    generation: {
      ...scenario.generation,
      eventDetails
    }
  };
}

export function markEventDetailStatus(
  scenario: Scenario,
  eventIds: string[],
  status: SectionStatus
): Scenario {
  const eventDetails = { ...scenario.generation.eventDetails };
  const timeline = scenario.timeline.map((event) => {
    if (!eventIds.includes(event.id)) return event;
    eventDetails[event.id] = status;
    return {
      ...event,
      detailState:
        status === "loading"
          ? ("loading" as const)
          : status === "failed"
            ? ("failed" as const)
            : status === "complete"
              ? ("ready" as const)
              : event.detailState
    };
  });

  return {
    ...scenario,
    timeline,
    generation: {
      ...scenario.generation,
      eventDetails
    }
  };
}

export function mergeConclusion(
  scenario: Scenario,
  conclusion: ScenarioConclusion
): Scenario {
  return {
    ...scenario,
    alternateOutcomes: conclusion.alternateOutcomes,
    finalState: conclusion.finalState,
    generation: {
      ...scenario.generation,
      conclusion: "complete"
    }
  };
}

export function mergeSources(scenario: Scenario, sources: ScenarioSource[]): Scenario {
  return {
    ...scenario,
    sources,
    generation: {
      ...scenario.generation,
      sources: "complete"
    }
  };
}

export function isDeepAnalysisPending(scenario: Scenario) {
  const detailsPending =
    scenario.depth !== "quick" &&
    scenario.timeline.some(
      (event) => event.detailState === "outline" || event.detailState === "loading"
    );
  const conclusionPending =
    scenario.generation.conclusion === "pending" ||
    scenario.generation.conclusion === "loading";
  const sourcesPending =
    scenario.generation.sources === "pending" ||
    scenario.generation.sources === "loading";

  return detailsPending || conclusionPending || sourcesPending;
}
