import { NextResponse } from "next/server";
import { applyCacheToScenario, getCachedScenario, saveFoundationCache } from "@/lib/cache";
import { foundationToScenario } from "@/lib/normalizeScenario";
import { createStructuredResponse, createSlug, isTimeoutError } from "@/lib/openai";
import { createFoundationJsonSchema, createFoundationSchema, generationDepths } from "@/lib/scenarioSchema";
import { getFastModel } from "@/lib/openai";
import type { GenerationDepth } from "@/lib/types";
import { eventCountForDepth } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const FOUNDATION_TIMEOUT_MS = 40_000;

const SYSTEM_PROMPT = `You build a fast alternate-history foundation for Ripple.

Return only a concise Stage 1 foundation:
- title, summary, point of divergence
- short historical context (brief overview + short lists)
- core assumptions (3-5)
- overall plausibility
- timeline event OUTLINES only

Do NOT include detailed event analysis, winners/losers, alternate outcomes, final-world essays, or sources.

Rules:
- Systems adapt; avoid great-person fallacy
- Later events should be less certain
- Each event summary: 2 to 4 sentences
- Each event must add something new
- No markdown, no URLs in prose
- Preserve the exact user prompt
- Use the supplied id exactly`;

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing. Add it to .env.local and restart the development server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const depth = (generationDepths.includes(body.depth) ? body.depth : "standard") as GenerationDepth;
    const requestedId = typeof body.id === "string" ? body.id.trim() : "";

    if (question.length < 8 || question.length > 500) {
      return NextResponse.json(
        { error: "Enter a what-if question between 8 and 500 characters." },
        { status: 400 }
      );
    }

    const id = requestedId || createSlug(question);
    const cached = getCachedScenario(question, depth);
    if (cached?.foundation) {
      const hydrated = applyCacheToScenario({
        ...cached.foundation,
        id,
        prompt: question,
        depth
      });
      return NextResponse.json({ ...hydrated, cached: true });
    }

    const counts = eventCountForDepth(depth);
    const model = getFastModel();
    const { data, durationMs } = await createStructuredResponse<{
      id: string;
      title: string;
      prompt: string;
      summary: string;
      pointOfDivergence: {
        title: string;
        date: string;
        description: string;
        whyThisDate: string;
        immediateChange: string;
      };
      historicalContext: {
        overview: string;
        keyConditions: string[];
        importantActors: string[];
        structuralForces: string[];
      };
      coreAssumptions: string[];
      plausibility: {
        score: number;
        label: "High" | "Moderate" | "Low";
        explanation: string;
      };
      timeline: Array<{
        id: string;
        date: string;
        era: string;
        category:
          | "Politics"
          | "Culture"
          | "War and diplomacy"
          | "Business"
          | "Technology"
          | "Society"
          | "Economics"
          | "Daily life";
        title: string;
        summary: string;
        confidence: {
          score: number;
          label: "High" | "Moderate" | "Low";
          reason: string;
        };
      }>;
    }>({
      route: "generate:foundation",
      model,
      timeoutMs: FOUNDATION_TIMEOUT_MS,
      schemaName: "ripple_foundation",
      schema: createFoundationJsonSchema(depth) as unknown as Record<string, unknown>,
      system: SYSTEM_PROMPT,
      user: `id: ${id}
Question: ${question}
Depth: ${depth}
Generate ${counts.min}-${counts.max} timeline event outlines now.`
    });

    const parsed = createFoundationSchema(depth).parse({
      ...data,
      id,
      prompt: question
    });
    const scenario = foundationToScenario(parsed, depth, id);
    saveFoundationCache(scenario);

    console.info(
      `[generate:foundation] events=${scenario.timeline.length} duration=${(durationMs / 1000).toFixed(1)}s cached=false`
    );

    return NextResponse.json(scenario);
  } catch (error) {
    console.error("Foundation generation failed:", error);
    return NextResponse.json(
      {
        error: isTimeoutError(error)
          ? "Foundation generation timed out. Please retry."
          : "Ripple could not build this foundation. Please try again."
      },
      { status: 500 }
    );
  }
}
