import { NextResponse } from "next/server";
import { saveConclusionCache } from "@/lib/cache";
import { sanitizeProse } from "@/lib/sources";
import { createStructuredResponse, getDeepModel, isTimeoutError } from "@/lib/openai";
import { getClientIp } from "@/lib/requestMeta";
import {
  generationDepths,
  scenarioConclusionJsonSchema,
  scenarioConclusionSchema
} from "@/lib/scenarioSchema";
import { recordTokenUsage } from "@/lib/tokenUsageRepository";
import type { GenerationDepth, ScenarioConclusion } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const CONCLUSION_TIMEOUT_MS = 55_000;

const SYSTEM_PROMPT = `You write concise alternate-history conclusions for Riple.

Return:
- 2 to 4 alternateOutcomes with probability labels
- finalState across politics, culture, economics, technology, dailyLife, globalEffects

Writing style (critical):
- Write for a curious everyday reader, not a historian or academic
- Use plain, conversational English a high-school student could follow
- Prefer short, concrete sentences over abstract theory
- Avoid jargon and PhD-sounding phrases
- Describe how ordinary life, money, tech, and power actually feel different
- Sound like a smart friend wrapping up a story, not a research paper

Keep each field to 1-3 sentences. No markdown. No URLs. Uncertainty should increase for long-range claims.`;

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing." }, { status: 500 });
    }

    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const scenarioId = typeof body.scenarioId === "string" ? body.scenarioId.trim() : "";
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
    const { data, usage, requestId } = await createStructuredResponse<ScenarioConclusion>({
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
    try {
      await recordTokenUsage({
        scenarioId,
        ipAddress,
        route: "conclusion",
        model,
        usage,
        requestId
      });
    } catch (error) {
      console.error("Failed to record conclusion token usage:", error);
    }
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
