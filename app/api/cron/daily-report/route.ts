import { NextResponse } from "next/server";
import { sendReportEmail } from "@/lib/email";
import { isDatabaseConfigured } from "@/lib/db";
import { buildDailyUsageReport, formatUsageReportEmail } from "@/lib/usageReport";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("authorization") || "";
  if (header === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

async function runDailyReport() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const reportTo = process.env.REPORT_EMAIL?.trim();
  if (!reportTo) {
    return NextResponse.json({ error: "REPORT_EMAIL is not configured." }, { status: 500 });
  }

  const report = await buildDailyUsageReport();
  const email = formatUsageReportEmail(report);
  const sent = await sendReportEmail({
    to: reportTo,
    subject: email.subject,
    text: email.text,
    html: email.html
  });

  return NextResponse.json({
    ok: true,
    emailId: sent.id,
    day: report.dayLabel,
    requests: report.requests,
    totalTokens: report.totalTokens,
    estimatedCostUsd: Number(report.estimatedCostUsd.toFixed(4)),
    scenariosCreated: report.scenariosCreated
  });
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    return await runDailyReport();
  } catch (error) {
    console.error("Daily report failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Daily report failed."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
