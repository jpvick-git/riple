export type EventCategory =
  | "Politics"
  | "Culture"
  | "War and diplomacy"
  | "Business"
  | "Technology"
  | "Society"
  | "Economics"
  | "Daily life";

export type PlausibilityLabel = "High" | "Moderate" | "Low";
export type AlternateOutcomeProbability = "Most likely" | "Plausible" | "Less likely";
export type GenerationDepth = "quick" | "standard" | "deep";
export type SectionStatus = "pending" | "loading" | "complete" | "failed";
export type DetailLoadState = "outline" | "loading" | "ready" | "failed";

export interface PointOfDivergence {
  title: string;
  date: string;
  description: string;
  whyThisDate: string;
  immediateChange: string;
}

export interface HistoricalContext {
  overview: string;
  keyConditions: string[];
  importantActors: string[];
  structuralForces: string[];
}

export interface Plausibility {
  score: number;
  label: PlausibilityLabel;
  explanation: string;
}

export interface EventConfidence {
  score: number;
  label: PlausibilityLabel;
  reason: string;
}

export interface EventDetails {
  directConsequence: string;
  institutionalResponse: string;
  secondOrderEffects: string[];
  winners: string[];
  losers: string[];
  whatRemainsUnchanged: string[];
  uncertainties: string[];
  historicalLogic: string;
}

export interface TimelineEventOutline {
  id: string;
  date: string;
  era: string;
  category: EventCategory;
  title: string;
  summary: string;
  confidence: EventConfidence;
}

export interface TimelineEvent extends TimelineEventOutline {
  details: EventDetails | null;
  detailState: DetailLoadState;
  toneNote: string | null;
  sourceRefs: string[];
}

export interface AlternateOutcome {
  title: string;
  probability: AlternateOutcomeProbability;
  description: string;
}

export interface FinalState {
  politics: string;
  culture: string;
  economics: string;
  technology: string;
  dailyLife: string;
  globalEffects: string;
}

export interface ScenarioSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
}

export interface GenerationStatus {
  foundation: SectionStatus;
  eventDetails: Record<string, SectionStatus>;
  conclusion: SectionStatus;
  sources: SectionStatus;
}

export interface Scenario {
  kind?: "scenario";
  id: string;
  title: string;
  prompt: string;
  summary: string;
  depth: GenerationDepth;
  pointOfDivergence: PointOfDivergence;
  historicalContext: HistoricalContext;
  coreAssumptions: string[];
  plausibility: Plausibility;
  timeline: TimelineEvent[];
  alternateOutcomes: AlternateOutcome[];
  finalState: FinalState | null;
  sources: ScenarioSource[];
  generation: GenerationStatus;
}

export interface PendingScenarioShell {
  kind: "pending";
  id: string;
  prompt: string;
  depth: GenerationDepth;
  generation: GenerationStatus;
}

export interface EventDetailPayload {
  eventId: string;
  details: EventDetails;
  toneNote: string | null;
  sourceRefs: string[];
}

export interface ScenarioConclusion {
  alternateOutcomes: AlternateOutcome[];
  finalState: FinalState;
}

export function eventCountForDepth(depth: GenerationDepth): { min: number; max: number } {
  if (depth === "quick") return { min: 5, max: 6 };
  if (depth === "deep") return { min: 8, max: 10 };
  return { min: 6, max: 8 };
}
