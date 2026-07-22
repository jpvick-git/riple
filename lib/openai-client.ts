import type { GenerationDepth } from "@/lib/types";

/** Browser-safe slug helper (no Node crypto). */
export function createSlug(question: string) {
  return (
    question
      .toLowerCase()
      .replace(/^what if\s+/i, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "new-riple"
  );
}

/** Canonical scenario id: prompt slug + depth (avoids depth collisions). */
export function createScenarioId(question: string, depth: GenerationDepth | string) {
  return `${createSlug(question)}--${depth}`;
}
