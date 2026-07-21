import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { getScenarioById } from "@/lib/scenarioRepository";

export const runtime = "nodejs";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database is not configured." },
        { status: 503 }
      );
    }

    const scenario = await getScenarioById(params.id);
    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found." }, { status: 404 });
    }

    return NextResponse.json(scenario);
  } catch (error) {
    console.error("Scenario load failed:", error);
    return NextResponse.json({ error: "Could not load scenario." }, { status: 500 });
  }
}
