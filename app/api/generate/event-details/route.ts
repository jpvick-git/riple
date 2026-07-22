import { NextResponse } from "next/server";
import { saveEventDetailsCache } from "@/lib/cache";
import { normalizeEventDetailPayload } from "@/lib/normalizeScenario";
import { createStructuredResponse, getDeepModel, isTimeoutError } from "@/lib/openai";
import { getClientIp } from "@/lib/requestMeta";
import { eventDetailsJsonSchema, eventDetailsResponseSchema, generationDepths } from "@/lib/scenarioSchema";
import { recordTokenUsage } from "@/lib/tokenUsageRepository";
import type { EventDetailPayload, GenerationDepth, TimelineEventOutline } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const DETAIL_TIMEOUT_MS = 55_000;

const SYSTEM_PROMPT = `You deepen alternate-history timeline events for Riple.

Given the point of divergence, assumptions, and compact event outlines, write detailed analysis for ONLY the requested event IDs.

For each requested event return:
- directConsequence
- institutionalResponse
- secondOrderEffects (at least 3)
- winners / losers
- whatRemainsUnchanged
- uncertainties
- historicalLogic
- toneNote (usually null; rare restrained humor only)
- sourceRefs (ids only if known; otherwise empty)

Keep each prose field to 1-3 sentences. No markdown. No URLs in prose. Do not invent sources.`;

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
    const eventIds = Array.isArray(body.eventIds)
      ? body.eventIds.filter((id: unknown): id is string => typeof id === "string").slice(0, 2)
      : [];

    if (!prompt || eventIds.length === 0) {
      return NextResponse.json({ error: "prompt and eventIds are required." }, { status: 400 });
    }

    const pointOfDivergence = body.pointOfDivergence ?? {};
    const coreAssumptions = Array.isArray(body.coreAssumptions) ? body.coreAssumptions : [];
    const timelineOutlines = Array.isArray(body.timelineOutlines)
      ? (body.timelineOutlines as TimelineEventOutline[])
      : [];

    const targets = timelineOutlines.filter((event) => eventIds.includes(event.id));
    if (targets.length === 0) {
      return NextResponse.json({ error: "No matching events found for the requested IDs." }, { status: 400 });
    }

    const model = getDeepModel();
    const { data, usage, requestId } = await createStructuredResponse<{ events: EventDetailPayload[] }>({
      route: "generate:event-details",
      model,
      timeoutMs: DETAIL_TIMEOUT_MS,
      schemaName: "riple_event_details",
      schema: eventDetailsJsonSchema as unknown as Record<string, unknown>,
      system: SYSTEM_PROMPT,
      user: JSON.stringify({
        prompt,
        pointOfDivergence: {
          title: pointOfDivergence.title,
          date: pointOfDivergence.date,
          immediateChange: pointOfDivergence.immediateChange
        },
        coreAssumptions,
        timelineOutlines: timelineOutlines.map((event) => ({
          id: event.id,
          date: event.date,
          era: event.era,
          category: event.category,
          title: event.title,
          summary: event.summary
        })),
        expandEventIds: targets.map((event) => event.id)
      })
    });

    const parsed = eventDetailsResponseSchema.parse(data);
    const events = parsed.events
      .filter((item) => eventIds.includes(item.eventId))
      .map(normalizeEventDetailPayload);

    saveEventDetailsCache(prompt, depth, events);
    try {
      await recordTokenUsage({
        scenarioId,
        ipAddress,
        route: "event-details",
        model,
        usage,
        requestId
      });
    } catch (error) {
      console.error("Failed to record event-details token usage:", error);
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Event detail generation failed:", error);
    return NextResponse.json(
      {
        error: isTimeoutError(error)
          ? "Event detail generation timed out. Please retry this event."
          : "Could not deepen these events. Please retry."
      },
      { status: 500 }
    );
  }
}
