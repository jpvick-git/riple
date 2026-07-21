import type { GenerationDepth, GenerationStatus, PendingScenarioShell, Scenario } from "@/lib/types";

const STORAGE_PREFIX = "ripple:";

export function storageKey(id: string) {
  return `${STORAGE_PREFIX}${id}`;
}

export function createPendingShell(
  id: string,
  prompt: string,
  depth: GenerationDepth
): PendingScenarioShell {
  return {
    kind: "pending",
    id,
    prompt,
    depth,
    generation: {
      foundation: "pending",
      eventDetails: {},
      conclusion: "pending",
      sources: "pending"
    }
  };
}

export function saveScenarioLocal(scenario: Scenario | PendingScenarioShell) {
  sessionStorage.setItem(storageKey(scenario.id), JSON.stringify(scenario));
}

export function loadScenarioLocal(id: string): Scenario | PendingScenarioShell | null {
  const raw = sessionStorage.getItem(storageKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Scenario | PendingScenarioShell;
  } catch {
    return null;
  }
}

export function isPendingShell(
  value: Scenario | PendingScenarioShell
): value is PendingScenarioShell {
  return value.kind === "pending";
}

export function needsFoundation(value: Scenario | PendingScenarioShell): boolean {
  if (isPendingShell(value)) return true;
  return value.generation.foundation !== "complete";
}

export function asPendingShell(value: Scenario | PendingScenarioShell): PendingScenarioShell {
  if (isPendingShell(value)) return value;
  return createPendingShell(value.id, value.prompt, value.depth);
}

export function emptyGenerationStatus(): GenerationStatus {
  return {
    foundation: "pending",
    eventDetails: {},
    conclusion: "pending",
    sources: "pending"
  };
}
