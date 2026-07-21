/**
 * Development/in-memory scenario cache.
 * Resets on server restart and is not suitable for multi-instance production.
 * Swap this module for a database-backed store when persistence is added.
 */

import type {
  EventDetailPayload,
  GenerationDepth,
  Scenario,
  ScenarioConclusion,
  ScenarioSource
} from "@/lib/types";
import { hashPrompt } from "@/lib/openai";

export interface CachedScenario {
  cacheKey: string;
  prompt: string;
  depth: GenerationDepth;
  foundation: Scenario | null;
  eventDetails: Record<string, EventDetailPayload>;
  conclusion: ScenarioConclusion | null;
  sources: ScenarioSource[];
  updatedAt: number;
}

const globalForCache = globalThis as typeof globalThis & {
  __ripleScenarioCache?: Map<string, CachedScenario>;
};

function store() {
  if (!globalForCache.__ripleScenarioCache) {
    globalForCache.__ripleScenarioCache = new Map();
  }
  return globalForCache.__ripleScenarioCache;
}

export function getCacheKey(prompt: string, depth: GenerationDepth) {
  return hashPrompt(prompt, depth);
}

export function getCachedScenario(prompt: string, depth: GenerationDepth) {
  return store().get(getCacheKey(prompt, depth)) ?? null;
}

export function saveFoundationCache(scenario: Scenario) {
  const cacheKey = getCacheKey(scenario.prompt, scenario.depth);
  const existing = store().get(cacheKey);
  store().set(cacheKey, {
    cacheKey,
    prompt: scenario.prompt,
    depth: scenario.depth,
    foundation: scenario,
    eventDetails: existing?.eventDetails ?? {},
    conclusion: existing?.conclusion ?? null,
    sources: existing?.sources ?? [],
    updatedAt: Date.now()
  });
}

export function saveEventDetailsCache(
  prompt: string,
  depth: GenerationDepth,
  details: EventDetailPayload[]
) {
  const cacheKey = getCacheKey(prompt, depth);
  const existing = store().get(cacheKey) ?? {
    cacheKey,
    prompt,
    depth,
    foundation: null,
    eventDetails: {},
    conclusion: null,
    sources: [],
    updatedAt: Date.now()
  };

  for (const detail of details) {
    existing.eventDetails[detail.eventId] = detail;
  }
  existing.updatedAt = Date.now();
  store().set(cacheKey, existing);
}

export function saveConclusionCache(
  prompt: string,
  depth: GenerationDepth,
  conclusion: ScenarioConclusion
) {
  const cacheKey = getCacheKey(prompt, depth);
  const existing = store().get(cacheKey);
  if (!existing) return;
  existing.conclusion = conclusion;
  existing.updatedAt = Date.now();
  store().set(cacheKey, existing);
}

export function saveSourcesCache(
  prompt: string,
  depth: GenerationDepth,
  sources: ScenarioSource[]
) {
  const cacheKey = getCacheKey(prompt, depth);
  const existing = store().get(cacheKey);
  if (!existing) return;
  existing.sources = sources;
  existing.updatedAt = Date.now();
  store().set(cacheKey, existing);
}

export function applyCacheToScenario(scenario: Scenario): Scenario {
  const cached = getCachedScenario(scenario.prompt, scenario.depth);
  if (!cached) return scenario;

  const timeline = scenario.timeline.map((event) => {
    const detail = cached.eventDetails[event.id];
    if (!detail) return event;
    return {
      ...event,
      details: detail.details,
      toneNote: detail.toneNote,
      sourceRefs: detail.sourceRefs,
      detailState: "ready" as const
    };
  });

  const eventDetailsStatus = { ...scenario.generation.eventDetails };
  for (const event of timeline) {
    if (event.detailState === "ready") {
      eventDetailsStatus[event.id] = "complete";
    }
  }

  return {
    ...scenario,
    timeline,
    alternateOutcomes: cached.conclusion?.alternateOutcomes ?? scenario.alternateOutcomes,
    finalState: cached.conclusion?.finalState ?? scenario.finalState,
    sources: cached.sources.length ? cached.sources : scenario.sources,
    generation: {
      ...scenario.generation,
      eventDetails: eventDetailsStatus,
      conclusion: cached.conclusion ? "complete" : scenario.generation.conclusion,
      sources: cached.sources.length ? "complete" : scenario.generation.sources
    }
  };
}
