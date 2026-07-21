import { NextResponse } from "next/server";
import { saveConclusionCache } from "@/lib/cache";
import { sanitizeProse } from "@/lib/sources";
import { createStructuredResponse, getDeepModel, isTimeoutError } from "@/lib/openai";
import {
  generationDepths,
  scenarioConclusionJsonSchema,
  scenarioConclusionSchema
} from "@/lib/scenarioSchema";
import type { GenerationDepth, ScenarioConclusion } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const CONCLUSION_TIMEOUT_MS = 55_000;

const SYSTEM_PROMPT = `You write concise alternate-history conclusions for Riple.

Return:
- 2 to 4 alternateOutcomes with probability labels
- finalState across politics, culture, economics, technology, dailyLife, globalEffects

Keep each field to 1-3 sentences. No markdown. No URLs. Uncertainty should increase for long-range claims.`;

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing." }, { status: 500 });
    }

    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const depth = (generationDepths.includes(body.depth) ? body.depth : "standard") as GenerationDepth;
    const title = typeof body.title === "string" ? body.title : "";
    const summary = typeof body.summary === "string" ? body.summary : "";
    const pointOfDivergence = body.pointOfDivergence ?? {};
    const eventSummaries = Array.isArray(body.eventSummaries) ? body.eventSummaries : [];

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required." }, { status: 400 });
    }

    const outcomeMax = depth === "deep" ? 4 : 3;
    const model = getDeepModel();
    const { data } = await createStructuredResponse<ScenarioConclusion>({
      route: "generate:conclusion",
      model,
      timeoutMs: CONCLUSION_TIMEOUT_MS,
      schemaName: "riple_conclusion",
      schema: scenarioConclusionJsonSchema as unknown as Record<string, unknown>,
      system: SYSTEM_PROMPT,
      user: JSON.stringify({
        prompt,
        title,
        summary,
        pointOfDivergence: {
          title: pointOfDivergence.title,
          date: pointOfDivergence.date,
          immediateChange: pointOfDivergence.immediateChange
        },
        eventSummaries: eventSummaries.slice(0, 12),
        alternateOutcomeCount: outcomeMax
      })
    });

    const parsed = scenarioConclusionSchema.parse(data);
    const conclusion: ScenarioConclusion = {
      alternateOutcomes: parsed.alternateOutcomes.slice(0, outcomeMax).map((outcome) => ({
        title: sanitizeProse(outcome.title),
        probability: outcome.probability,
        description: sanitizeProse(outcome.description)
      })),
      finalState: {
        politics: sanitizeProse(parsed.finalState.politics),
        culture: sanitizeProse(parsed.finalState.culture),
        economics: sanitizeProse(parsed.finalState.economics),
        technology: sanitizeProse(parsed.finalState.technology),
        dailyLife: sanitizeProse(parsed.finalState.dailyLife),
        globalEffects: sanitizeProse(parsed.finalState.globalEffects)
      }
    };

    saveConclusionCache(prompt, depth, conclusion);
    return NextResponse.json(conclusion);
  } catch (error) {
    console.error("Conclusion generation failed:", error);
    return NextResponse.json(
      {
        error: isTimeoutError(error)
          ? "Conclusion generation timed out. Please retry."
          : "Could not generate the conclusion. Please retry."
      },
      { status: 500 }
    );
  }
}
