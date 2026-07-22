import { NextResponse } from "next/server";
import { applyCacheToScenario, getCachedScenario, saveFoundationCache } from "@/lib/cache";
import { foundationToScenario } from "@/lib/normalizeScenario";
import {
  createScenarioId,
  createStructuredResponse,
  getFastModel,
  hashPrompt,
  isTimeoutError
} from "@/lib/openai";
import { createFoundationJsonSchema, createFoundationSchema, generationDepths } from "@/lib/scenarioSchema";
import { getClientIp } from "@/lib/requestMeta";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getScenarioByPromptHash, saveScenario } from "@/lib/scenarioRepository";
import { recordTokenUsage } from "@/lib/tokenUsageRepository";
import type { GenerationDepth, Scenario } from "@/lib/types";
import { eventCountForDepth } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Foundation is the largest Stage-1 payload; keep under maxDuration with headroom. */
const FOUNDATION_TIMEOUT_MS = 55_000;

const SYSTEM_PROMPT = `You build a fast alternate-history foundation for Riple.

Return only a concise Stage 1 foundation:
- title, summary, point of divergence
- short historical context (brief overview + short lists)
- core assumptions (3-5)
- overall plausibility
- timeline event OUTLINES only

Do NOT include detailed event analysis, winners/losers, alternate outcomes, final-world essays, or sources.

Writing style (critical):
- Write for a curious everyday reader, not a historian or academic
- Use plain, conversational English a high-school student could follow
- Prefer short, concrete sentences over abstract theory
- Avoid jargon, Latinate hedging, and PhD-sounding phrases (e.g. "structural forces," "contingent cascade," "catalytic," "institutional frameworks," "great-person fallacy")
- Say what happens and why in simple terms; explain ideas instead of naming concepts
- Sound like a smart friend telling a story, not a research paper
- Even for fields named structuralForces / keyConditions / importantActors: fill them with plain everyday wording (money, wars, jobs, tech, fame, laws) — never jargon labels

Rules:
- Systems and incentives matter more than one heroic person
- Later events should be less certain
- Each event summary: 2 to 4 sentences
- Each event must add something new
- No markdown, no URLs in prose
- Preserve the exact user prompt
- Use the supplied id exactly`;

async function recordCacheHit(scenarioId: string, ipAddress: string) {
  try {
    await recordTokenUsage({
      scenarioId,
      ipAddress,
      route: "foundation",
      model: "cache",
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      cached: true
    });
  } catch (error) {
    console.error("Failed to record cached token usage:", error);
  }
}

async function returnCachedFoundation(
  scenario: Scenario,
  ipAddress: string,
  source: "postgres" | "memory"
) {
  try {
    await saveScenario(scenario);
  } catch (error) {
    console.error("Failed to persist cached foundation:", error);
  }
  await recordCacheHit(scenario.id, ipAddress);
  console.info(
    `[generate:foundation] id=${scenario.id} cached=true source=${source}`
  );
  return NextResponse.json(scenario);
}

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);

  const limit = await checkRateLimit(ipAddress);
  if (!limit.ok) return rateLimitResponse(limit);

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
    // Only accept opaque client ids; reject guessable legacy slug--depth forms.
    const safeRequestedId = /^[a-f0-9]{64}$/i.test(requestedId) ? requestedId : "";

    if (question.length < 8 || question.length > 500) {
      return NextResponse.json(
        { error: "Enter a what-if question between 8 and 500 characters." },
        { status: 400 }
      );
    }

    const promptHash = hashPrompt(question, depth);

    try {
      const existing = await getScenarioByPromptHash(promptHash);
      if (existing?.generation?.foundation === "complete") {
        const hydrated = applyCacheToScenario(existing);
        return returnCachedFoundation(hydrated, ipAddress, "postgres");
      }
    } catch (error) {
      console.error("Postgres prompt_hash lookup failed:", error);
    }

    const memoryCached = getCachedScenario(question, depth);
    if (memoryCached?.foundation) {
      const canonicalId =
        memoryCached.foundation.id || safeRequestedId || createScenarioId();
      const hydrated = applyCacheToScenario({
        ...memoryCached.foundation,
        id: canonicalId,
        prompt: question,
        depth
      });
      return returnCachedFoundation(hydrated, ipAddress, "memory");
    }

    const id = safeRequestedId || createScenarioId();
    const counts = eventCountForDepth(depth);
    const model = getFastModel();
    const { data, durationMs, usage, requestId } = await createStructuredResponse<{
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
      schemaName: "riple_foundation",
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
    try {
      await saveScenario(scenario);
    } catch (error) {
      console.error("Failed to persist foundation scenario:", error);
    }
    try {
      await recordTokenUsage({
        scenarioId: id,
        ipAddress,
        route: "foundation",
        model,
        usage,
        requestId
      });
    } catch (error) {
      console.error("Failed to record foundation token usage:", error);
    }

    console.info(
      `[generate:foundation] events=${scenario.timeline.length} duration=${(durationMs / 1000).toFixed(1)}s cached=false tokens=${usage.totalTokens}`
    );

    return NextResponse.json(scenario);
  } catch (error) {
    console.error("Foundation generation failed:", error);
    return NextResponse.json(
      {
        error: isTimeoutError(error)
          ? "Foundation generation timed out. Please retry."
          : "Riple could not build this foundation. Please try again."
      },
      { status: 500 }
    );
  }
}
