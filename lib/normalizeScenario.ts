import type {
  EventConfidence,
  EventDetailPayload,
  EventDetails,
  GenerationDepth,
  GenerationStatus,
  PlausibilityLabel,
  Scenario,
  ScenarioSource,
  TimelineEvent,
  TimelineEventOutline
} from "@/lib/types";
import { sanitizeProse, sanitizeStringList, normalizeSourceUrl } from "@/lib/sources";

function asLabel(score: number, provided?: string): PlausibilityLabel {
  if (provided === "High" || provided === "Moderate" || provided === "Low") {
    return provided;
  }
  if (score >= 70) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
}

export function normalizeConfidence(raw: EventConfidence): EventConfidence {
  const score = Math.max(0, Math.min(100, Math.round(raw.score)));
  return {
    score,
    label: asLabel(score, raw.label),
    reason: sanitizeProse(raw.reason)
  };
}

export function normalizeDetails(raw: EventDetails): EventDetails {
  return {
    directConsequence: sanitizeProse(raw.directConsequence),
    institutionalResponse: sanitizeProse(raw.institutionalResponse),
    secondOrderEffects: sanitizeStringList(raw.secondOrderEffects),
    winners: sanitizeStringList(raw.winners),
    losers: sanitizeStringList(raw.losers),
    whatRemainsUnchanged: sanitizeStringList(raw.whatRemainsUnchanged),
    uncertainties: sanitizeStringList(raw.uncertainties),
    historicalLogic: sanitizeProse(raw.historicalLogic)
  };
}

export function normalizeSources(sources: ScenarioSource[]): ScenarioSource[] {
  const seen = new Set<string>();
  const normalized: ScenarioSource[] = [];

  for (const source of sources) {
    const id = sanitizeProse(source.id) || `source-${normalized.length + 1}`;
    if (seen.has(id)) continue;
    const url = normalizeSourceUrl(source.url);
    if (!url) continue;
    seen.add(id);
    normalized.push({
      id,
      title: sanitizeProse(source.title) || "Source",
      publisher: sanitizeProse(source.publisher),
      url
    });
  }

  return normalized;
}

export function normalizeEventDetailPayload(raw: EventDetailPayload): EventDetailPayload {
  return {
    eventId: sanitizeProse(raw.eventId),
    details: normalizeDetails(raw.details),
    toneNote: raw.toneNote ? sanitizeProse(raw.toneNote) : null,
    sourceRefs: sanitizeStringList(raw.sourceRefs)
  };
}

function createGenerationStatus(timeline: TimelineEventOutline[]): GenerationStatus {
  const eventDetails: Record<string, GenerationStatus["eventDetails"][string]> = {};
  for (const event of timeline) {
    eventDetails[event.id] = "pending";
  }
  return {
    foundation: "complete",
    eventDetails,
    conclusion: "pending",
    sources: "pending"
  };
}

export function foundationToScenario(
  foundation: {
    id: string;
    title: string;
    prompt: string;
    summary: string;
    pointOfDivergence: Scenario["pointOfDivergence"];
    historicalContext: Scenario["historicalContext"];
    coreAssumptions: string[];
    plausibility: Scenario["plausibility"];
    timeline: TimelineEventOutline[];
  },
  depth: GenerationDepth,
  fallbackId: string
): Scenario {
  const timeline: TimelineEvent[] = foundation.timeline.map((event, index) => ({
    id: sanitizeProse(event.id) || `event-${index + 1}`,
    date: sanitizeProse(event.date),
    era: sanitizeProse(event.era),
    category: event.category,
    title: sanitizeProse(event.title),
    summary: sanitizeProse(event.summary),
    confidence: normalizeConfidence(event.confidence),
    details: null,
    detailState: "outline",
    toneNote: null,
    sourceRefs: []
  }));

  return {
    id: sanitizeProse(foundation.id) || fallbackId,
    kind: "scenario",
    title: sanitizeProse(foundation.title),
    prompt: sanitizeProse(foundation.prompt),
    summary: sanitizeProse(foundation.summary),
    depth,
    pointOfDivergence: {
      title: sanitizeProse(foundation.pointOfDivergence.title),
      date: sanitizeProse(foundation.pointOfDivergence.date),
      description: sanitizeProse(foundation.pointOfDivergence.description),
      whyThisDate: sanitizeProse(foundation.pointOfDivergence.whyThisDate),
      immediateChange: sanitizeProse(foundation.pointOfDivergence.immediateChange)
    },
    historicalContext: {
      overview: sanitizeProse(foundation.historicalContext.overview),
      keyConditions: sanitizeStringList(foundation.historicalContext.keyConditions),
      importantActors: sanitizeStringList(foundation.historicalContext.importantActors),
      structuralForces: sanitizeStringList(foundation.historicalContext.structuralForces)
    },
    coreAssumptions: sanitizeStringList(foundation.coreAssumptions),
    plausibility: {
      score: Math.max(0, Math.min(100, Math.round(foundation.plausibility.score))),
      label: asLabel(foundation.plausibility.score, foundation.plausibility.label),
      explanation: sanitizeProse(foundation.plausibility.explanation)
    },
    timeline,
    alternateOutcomes: [],
    finalState: null,
    sources: [],
    generation: createGenerationStatus(timeline)
  };
}
