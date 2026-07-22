import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { isScenarioComplete } from "@/lib/mergeScenario";
import { hashPrompt } from "@/lib/openai";
import { generationDepths } from "@/lib/scenarioSchema";
import { getScenarioByPromptHash } from "@/lib/scenarioRepository";
import type { GenerationDepth } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database is not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const depth = (generationDepths.includes(body.depth) ? body.depth : "standard") as GenerationDepth;

    if (question.length < 8 || question.length > 500) {
      return NextResponse.json(
        { error: "Enter a what-if question between 8 and 500 characters." },
        { status: 400 }
      );
    }

    const promptHash = hashPrompt(question, depth);
    const scenario = await getScenarioByPromptHash(promptHash);
    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: scenario.id,
      complete: isScenarioComplete(scenario)
    });
  } catch (error) {
    console.error("Scenario lookup failed:", error);
    return NextResponse.json({ error: "Could not look up scenario." }, { status: 500 });
  }
}
