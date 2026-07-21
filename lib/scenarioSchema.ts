import { z } from "zod";
import { eventCountForDepth, type GenerationDepth } from "@/lib/types";

export const eventCategories = [
  "Politics",
  "Culture",
  "War and diplomacy",
  "Business",
  "Technology",
  "Society",
  "Economics",
  "Daily life"
] as const;

export const plausibilityLabels = ["High", "Moderate", "Low"] as const;
export const alternateOutcomeProbabilities = [
  "Most likely",
  "Plausible",
  "Less likely"
] as const;
export const generationDepths = ["quick", "standard", "deep"] as const;

const stringList = z.array(z.string());

export const eventConfidenceSchema = z.object({
  score: z.number().int().min(0).max(100),
  label: z.enum(plausibilityLabels),
  reason: z.string().min(1)
});

export const timelineEventOutlineSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  era: z.string().min(1),
  category: z.enum(eventCategories),
  title: z.string().min(1),
  summary: z.string().min(1),
  confidence: eventConfidenceSchema
});

export const eventDetailsSchema = z.object({
  directConsequence: z.string().min(1),
  institutionalResponse: z.string().min(1),
  secondOrderEffects: stringList.min(1),
  winners: stringList,
  losers: stringList,
  whatRemainsUnchanged: stringList,
  uncertainties: stringList,
  historicalLogic: z.string().min(1)
});

export const eventDetailPayloadSchema = z.object({
  eventId: z.string().min(1),
  details: eventDetailsSchema,
  toneNote: z.string().nullable(),
  sourceRefs: stringList
});

export const eventDetailsResponseSchema = z.object({
  events: z.array(eventDetailPayloadSchema).min(1).max(2)
});

export function createFoundationSchema(depth: GenerationDepth) {
  const { min, max } = eventCountForDepth(depth);
  return z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    prompt: z.string().min(1),
    summary: z.string().min(1),
    pointOfDivergence: z.object({
      title: z.string().min(1),
      date: z.string().min(1),
      description: z.string().min(1),
      whyThisDate: z.string().min(1),
      immediateChange: z.string().min(1)
    }),
    historicalContext: z.object({
      overview: z.string().min(1),
      keyConditions: stringList.min(1).max(5),
      importantActors: stringList.min(1).max(5),
      structuralForces: stringList.min(1).max(5)
    }),
    coreAssumptions: stringList.min(1).max(5),
    plausibility: z.object({
      score: z.number().int().min(0).max(100),
      label: z.enum(plausibilityLabels),
      explanation: z.string().min(1)
    }),
    timeline: z.array(timelineEventOutlineSchema).min(min).max(max)
  });
}

export const scenarioConclusionSchema = z.object({
  alternateOutcomes: z
    .array(
      z.object({
        title: z.string().min(1),
        probability: z.enum(alternateOutcomeProbabilities),
        description: z.string().min(1)
      })
    )
    .min(2)
    .max(4),
  finalState: z.object({
    politics: z.string().min(1),
    culture: z.string().min(1),
    economics: z.string().min(1),
    technology: z.string().min(1),
    dailyLife: z.string().min(1),
    globalEffects: z.string().min(1)
  })
});

export const scenarioSourcesSchema = z.object({
  sources: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      publisher: z.string(),
      url: z.string()
    })
  )
});

export function createFoundationJsonSchema(depth: GenerationDepth) {
  const { min, max } = eventCountForDepth(depth);
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "title",
      "prompt",
      "summary",
      "pointOfDivergence",
      "historicalContext",
      "coreAssumptions",
      "plausibility",
      "timeline"
    ],
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      prompt: { type: "string" },
      summary: { type: "string" },
      pointOfDivergence: {
        type: "object",
        additionalProperties: false,
        required: ["title", "date", "description", "whyThisDate", "immediateChange"],
        properties: {
          title: { type: "string" },
          date: { type: "string" },
          description: { type: "string" },
          whyThisDate: { type: "string" },
          immediateChange: { type: "string" }
        }
      },
      historicalContext: {
        type: "object",
        additionalProperties: false,
        required: ["overview", "keyConditions", "importantActors", "structuralForces"],
        properties: {
          overview: { type: "string" },
          keyConditions: { type: "array", items: { type: "string" } },
          importantActors: { type: "array", items: { type: "string" } },
          structuralForces: { type: "array", items: { type: "string" } }
        }
      },
      coreAssumptions: { type: "array", items: { type: "string" } },
      plausibility: {
        type: "object",
        additionalProperties: false,
        required: ["score", "label", "explanation"],
        properties: {
          score: { type: "integer", minimum: 0, maximum: 100 },
          label: { type: "string", enum: [...plausibilityLabels] },
          explanation: { type: "string" }
        }
      },
      timeline: {
        type: "array",
        minItems: min,
        maxItems: max,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "date", "era", "category", "title", "summary", "confidence"],
          properties: {
            id: { type: "string" },
            date: { type: "string" },
            era: { type: "string" },
            category: { type: "string", enum: [...eventCategories] },
            title: { type: "string" },
            summary: { type: "string" },
            confidence: {
              type: "object",
              additionalProperties: false,
              required: ["score", "label", "reason"],
              properties: {
                score: { type: "integer", minimum: 0, maximum: 100 },
                label: { type: "string", enum: [...plausibilityLabels] },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    }
  } as const;
}

export const eventDetailsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["events"],
  properties: {
    events: {
      type: "array",
      minItems: 1,
      maxItems: 2,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["eventId", "details", "toneNote", "sourceRefs"],
        properties: {
          eventId: { type: "string" },
          details: {
            type: "object",
            additionalProperties: false,
            required: [
              "directConsequence",
              "institutionalResponse",
              "secondOrderEffects",
              "winners",
              "losers",
              "whatRemainsUnchanged",
              "uncertainties",
              "historicalLogic"
            ],
            properties: {
              directConsequence: { type: "string" },
              institutionalResponse: { type: "string" },
              secondOrderEffects: { type: "array", items: { type: "string" } },
              winners: { type: "array", items: { type: "string" } },
              losers: { type: "array", items: { type: "string" } },
              whatRemainsUnchanged: { type: "array", items: { type: "string" } },
              uncertainties: { type: "array", items: { type: "string" } },
              historicalLogic: { type: "string" }
            }
          },
          toneNote: { type: ["string", "null"] },
          sourceRefs: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
} as const;

export const scenarioConclusionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["alternateOutcomes", "finalState"],
  properties: {
    alternateOutcomes: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "probability", "description"],
        properties: {
          title: { type: "string" },
          probability: { type: "string", enum: [...alternateOutcomeProbabilities] },
          description: { type: "string" }
        }
      }
    },
    finalState: {
      type: "object",
      additionalProperties: false,
      required: [
        "politics",
        "culture",
        "economics",
        "technology",
        "dailyLife",
        "globalEffects"
      ],
      properties: {
        politics: { type: "string" },
        culture: { type: "string" },
        economics: { type: "string" },
        technology: { type: "string" },
        dailyLife: { type: "string" },
        globalEffects: { type: "string" }
      }
    }
  }
} as const;

export const scenarioSourcesJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["sources"],
  properties: {
    sources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "publisher", "url"],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          publisher: { type: "string" },
          url: { type: "string" }
        }
      }
    }
  }
} as const;
