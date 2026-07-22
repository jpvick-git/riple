import { NextResponse } from "next/server";
import { saveSourcesCache } from "@/lib/cache";
import { normalizeSources } from "@/lib/normalizeScenario";
import { createStructuredResponse, getFastModel, isTimeoutError } from "@/lib/openai";
import { getClientIp } from "@/lib/requestMeta";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  generationDepths,
  scenarioSourcesJsonSchema,
  scenarioSourcesSchema
} from "@/lib/scenarioSchema";
import { recordTokenUsage } from "@/lib/tokenUsageRepository";
import type { GenerationDepth, ScenarioSource } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SOURCES_TIMEOUT_MS = 45_000;

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);

  const limit = await checkRateLimit(ipAddress);
  if (!limit.ok) return rateLimitResponse(limit);

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing." }, { status: 500 });
    }

    if (process.env.OPENAI_WEB_SEARCH === "false") {
      return NextResponse.json({ sources: [] as ScenarioSource[] });
    }

    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const scenarioId = typeof body.scenarioId === "string" ? body.scenarioId.trim() : "";
    const depth = (generationDepths.includes(body.depth) ? body.depth : "standard") as GenerationDepth;
    const historicalOverview =
      typeof body.historicalOverview === "string" ? body.historicalOverview : "";

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required." }, { status: 400 });
    }

    const model = getFastModel();
    const { data, usage, requestId } = await createStructuredResponse<{ sources: ScenarioSource[] }>({
      route: "generate:sources",
      model,
      timeoutMs: SOURCES_TIMEOUT_MS,
      schemaName: "riple_sources",
      schema: scenarioSourcesJsonSchema as unknown as Record<string, unknown>,
      tools: [{ type: "web_search" }],
      system: `Return only real reference sources for factual historical context related to the prompt. Do not invent sources. Prefer reputable publishers. Clean URLs without tracking parameters. If none are reliable, return an empty sources array.`,
      user: JSON.stringify({ prompt, historicalOverview })
    });

    const parsed = scenarioSourcesSchema.parse(data);
    const sources = normalizeSources(parsed.sources);
    saveSourcesCache(prompt, depth, sources);
    try {
      await recordTokenUsage({
        scenarioId,
        ipAddress,
        route: "sources",
        model,
        usage,
        requestId
      });
    } catch (error) {
      console.error("Failed to record sources token usage:", error);
    }
    return NextResponse.json({ sources });
  } catch (error) {
    console.error("Sources generation failed:", error);
    return NextResponse.json(
      {
        error: isTimeoutError(error)
          ? "Source lookup timed out."
          : "Could not load sources.",
        sources: []
      },
      { status: 500 }
    );
  }
}
