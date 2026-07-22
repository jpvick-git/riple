"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isDeepAnalysisPending,
  markEventDetailStatus,
  mergeConclusion,
  mergeEventDetails,
  mergeSources
} from "@/lib/mergeScenario";
import {
  asPendingShell,
  loadScenarioLocal,
  needsFoundation,
  saveScenarioLocal
} from "@/lib/scenarioStorage";
import type {
  EventDetailPayload,
  PendingScenarioShell,
  Scenario,
  ScenarioConclusion,
  ScenarioSource
} from "@/lib/types";

function compactContext(scenario: Scenario) {
  return {
    scenarioId: scenario.id,
    prompt: scenario.prompt,
    depth: scenario.depth,
    title: scenario.title,
    summary: scenario.summary,
    pointOfDivergence: {
      title: scenario.pointOfDivergence.title,
      date: scenario.pointOfDivergence.date,
      immediateChange: scenario.pointOfDivergence.immediateChange
    },
    coreAssumptions: scenario.coreAssumptions,
    timelineOutlines: scenario.timeline.map((event) => ({
      id: event.id,
      date: event.date,
      era: event.era,
      category: event.category,
      title: event.title,
      summary: event.summary,
      confidence: event.confidence
    })),
    eventSummaries: scenario.timeline.map((event) => ({
      id: event.id,
      date: event.date,
      title: event.title,
      summary: event.summary
    })),
    historicalOverview: scenario.historicalContext.overview
  };
}

async function fetchJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Request failed.");
  }
  return result as T;
}

function chunkIds(ids: string[], size: number) {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}

export function useProgressiveScenario(slug: string) {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [pending, setPending] = useState<PendingScenarioShell | null>(null);
  const [missing, setMissing] = useState(false);
  const [foundationError, setFoundationError] = useState("");
  const [deepStatus, setDeepStatus] = useState("");
  const inFlightRef = useRef<Set<string>>(new Set());
  const deepenStartedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const persist = useCallback((next: Scenario) => {
    saveScenarioLocal(next);
    setScenario(next);
    void fetch("/api/scenarios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next)
    }).catch((error) => {
      console.error("Failed to persist scenario to database:", error);
    });
  }, []);

  const loadFoundation = useCallback(
    async (shell: PendingScenarioShell) => {
      setFoundationError("");
      setPending(shell);
      try {
        const foundation = await fetchJson<Scenario>("/api/generate", {
          question: shell.prompt,
          depth: shell.depth,
          id: shell.id
        });
        persist(foundation);
        setPending(null);
        return foundation;
      } catch (error) {
        setFoundationError(
          error instanceof Error ? error.message : "Foundation generation failed."
        );
        saveScenarioLocal({
          ...shell,
          generation: { ...shell.generation, foundation: "failed" }
        });
        return null;
      }
    },
    [persist]
  );

  const fetchEventDetails = useCallback(
    async (current: Scenario, eventIds: string[]) => {
      const needed = eventIds.filter((id) => {
        const event = current.timeline.find((item) => item.id === id);
        if (!event) return false;
        if (event.detailState === "ready") return false;
        if (inFlightRef.current.has(id)) return false;
        return true;
      });
      if (needed.length === 0) return current;

      needed.forEach((id) => inFlightRef.current.add(id));
      let next = markEventDetailStatus(current, needed, "loading");
      persist(next);
      setDeepStatus("Examining institutional reactions");

      try {
        const context = compactContext(next);
        const result = await fetchJson<{ events: EventDetailPayload[] }>(
          "/api/generate/event-details",
          {
            ...context,
            eventIds: needed
          }
        );
        next = mergeEventDetails(next, result.events, "complete");
        persist(next);
        return next;
      } catch {
        next = markEventDetailStatus(next, needed, "failed");
        persist(next);
        return next;
      } finally {
        needed.forEach((id) => inFlightRef.current.delete(id));
      }
    },
    [persist]
  );

  const prioritizeEvent = useCallback(
    async (eventId: string) => {
      if (!scenario) return;
      const event = scenario.timeline.find((item) => item.id === eventId);
      if (!event || event.detailState === "ready" || event.detailState === "loading") return;
      await fetchEventDetails(scenario, [eventId]);
    },
    [fetchEventDetails, scenario]
  );

  const retryEvent = useCallback(
    async (eventId: string) => {
      if (!scenario) return;
      await fetchEventDetails(scenario, [eventId]);
    },
    [fetchEventDetails, scenario]
  );

  const deepen = useCallback(
    async (foundation: Scenario) => {
      if (deepenStartedRef.current) return;
      deepenStartedRef.current = true;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      let current = foundation;

      const pendingIds = current.timeline
        .filter((event) => event.detailState !== "ready")
        .map((event) => event.id);

      if (foundation.depth === "quick") {
        // Quick mode: details on demand only.
      } else {
        const batches = chunkIds(pendingIds, 2);
        for (const batch of batches) {
          if (controller.signal.aborted) return;
          setDeepStatus(
            batch === batches[0]
              ? "Following second-order effects"
              : "Looking for unintended consequences"
          );
          current = await fetchEventDetails(current, batch);
        }
      }

      if (controller.signal.aborted) return;

      if (current.generation.conclusion !== "complete") {
        setDeepStatus("Testing long-term plausibility");
        current = {
          ...current,
          generation: { ...current.generation, conclusion: "loading" }
        };
        persist(current);
        try {
          const context = compactContext(current);
          const conclusion = await fetchJson<ScenarioConclusion>(
            "/api/generate/conclusion",
            context,
            controller.signal
          );
          current = mergeConclusion(current, conclusion);
          persist(current);
        } catch {
          current = {
            ...current,
            generation: { ...current.generation, conclusion: "failed" }
          };
          persist(current);
        }
      }

      if (controller.signal.aborted) return;

      if (current.generation.sources !== "complete") {
        current = {
          ...current,
          generation: { ...current.generation, sources: "loading" }
        };
        persist(current);
        try {
          const context = compactContext(current);
          const result = await fetchJson<{ sources: ScenarioSource[] }>(
            "/api/generate/sources",
            context,
            controller.signal
          );
          current = mergeSources(current, result.sources ?? []);
          persist(current);
        } catch {
          current = {
            ...current,
            generation: { ...current.generation, sources: "failed" },
            sources: current.sources
          };
          persist(current);
        }
      }

      setDeepStatus("");
    },
    [fetchEventDetails, persist]
  );

  const retryFoundation = useCallback(async () => {
    const stored = loadScenarioLocal(slug);
    if (!stored) {
      setMissing(true);
      return;
    }
    if (needsFoundation(stored)) {
      const foundation = await loadFoundation(asPendingShell(stored));
      if (foundation) {
        deepenStartedRef.current = false;
        void deepen(foundation);
      }
    }
  }, [deepen, loadFoundation, slug]);

  const retryConclusion = useCallback(async () => {
    if (!scenario) return;
    let current: Scenario = {
      ...scenario,
      generation: { ...scenario.generation, conclusion: "loading" }
    };
    persist(current);
    try {
      const conclusion = await fetchJson<ScenarioConclusion>(
        "/api/generate/conclusion",
        compactContext(current)
      );
      current = mergeConclusion(current, conclusion);
      persist(current);
    } catch {
      persist({
        ...current,
        generation: { ...current.generation, conclusion: "failed" }
      });
    }
  }, [persist, scenario]);

  useEffect(() => {
    deepenStartedRef.current = false;
    inFlightRef.current.clear();
    setFoundationError("");
    setDeepStatus("");
    setMissing(false);

    let cancelled = false;

    async function hydrate() {
      const stored = loadScenarioLocal(slug);

      if (stored && needsFoundation(stored)) {
        const foundation = await loadFoundation(asPendingShell(stored));
        if (!cancelled && foundation) void deepen(foundation);
        return;
      }

      let full = stored && !needsFoundation(stored) ? (stored as Scenario) : null;

      if (!full) {
        try {
          const response = await fetch(`/api/scenarios/${encodeURIComponent(slug)}`);
          if (response.ok) {
            full = (await response.json()) as Scenario;
            saveScenarioLocal(full);
          }
        } catch (error) {
          console.error("Failed to load scenario from database:", error);
        }
      }

      if (cancelled) return;

      if (!full) {
        setMissing(true);
        return;
      }

      const hydrated: Scenario = {
        ...full,
        kind: "scenario",
        depth: full.depth ?? "standard",
        finalState: full.finalState ?? null,
        alternateOutcomes: full.alternateOutcomes ?? [],
        sources: full.sources ?? [],
        timeline: (full.timeline ?? []).map((event) => ({
          ...event,
          details: event.details ?? null,
          detailState: event.details ? "ready" : event.detailState ?? "outline",
          toneNote: event.toneNote ?? null,
          sourceRefs: event.sourceRefs ?? []
        })),
        generation: full.generation ?? {
          foundation: "complete",
          eventDetails: Object.fromEntries(
            (full.timeline ?? []).map((event) => [
              event.id,
              event.details ? "complete" : "pending"
            ])
          ),
          conclusion: full.finalState ? "complete" : "pending",
          sources: (full.sources?.length ?? 0) > 0 ? "complete" : "pending"
        }
      };

      setScenario(hydrated);
      saveScenarioLocal(hydrated);
      if (isDeepAnalysisPending(hydrated)) {
        void deepen(hydrated);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [deepen, loadFoundation, slug]);

  return {
    scenario,
    pending,
    missing,
    foundationError,
    deepStatus,
    isDeepening: Boolean(scenario && isDeepAnalysisPending(scenario)),
    prioritizeEvent,
    retryEvent,
    retryFoundation,
    retryConclusion
  };
}
