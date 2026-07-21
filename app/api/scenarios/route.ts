import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { getScenarioById, saveScenario } from "@/lib/scenarioRepository";
import type { Scenario } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database is not configured.", skipped: true },
        { status: 503 }
      );
    }

    const body = (await request.json()) as Scenario;
    if (!body?.id || !body?.prompt || !Array.isArray(body.timeline)) {
      return NextResponse.json({ error: "Invalid scenario payload." }, { status: 400 });
    }

    await saveScenario(body);
    return NextResponse.json({ ok: true, id: body.id });
  } catch (error) {
    console.error("Scenario save failed:", error);
    return NextResponse.json({ error: "Could not save scenario." }, { status: 500 });
  }
}
