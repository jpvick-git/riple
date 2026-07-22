import { ensureSchema, isDatabaseConfigured, query } from "@/lib/db";
import { estimateCostUsd, formatUsd, getModelPricing } from "@/lib/pricing";

export type DailyUsageReport = {
  timeZone: string;
  dayLabel: string;
  windowStart: string;
  windowEnd: string;
  scenariosCreated: number;
  requests: number;
  cachedRequests: number;
  aiRequests: number;
  uniqueIps: number;
  uniqueScenarios: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  pricingIncomplete: boolean;
  byRoute: Array<{
    route: string;
    requests: number;
    cachedRequests: number;
    totalTokens: number;
    costUsd: number;
  }>;
  topIps: Array<{
    ipAddress: string;
    requests: number;
    totalTokens: number;
    costUsd: number;
  }>;
};

function formatDayLabel(isoDate: string) {
  // isoDate like 2026-07-21
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  return utc.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });
}

export async function buildDailyUsageReport(
  timeZone = process.env.REPORT_TZ || "America/Chicago"
): Promise<DailyUsageReport> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }
  await ensureSchema();

  const bounds = await query<{
    day_label: string;
    window_start: Date;
    window_end: Date;
  }>(
    `
      SELECT
        to_char(date_trunc('day', NOW() AT TIME ZONE $1), 'YYYY-MM-DD') AS day_label,
        (date_trunc('day', NOW() AT TIME ZONE $1) AT TIME ZONE $1) AS window_start,
        NOW() AS window_end
    `,
    [timeZone]
  );

  const bound = bounds.rows[0];
  if (!bound) {
    throw new Error("Could not compute report window.");
  }

  const windowStart = bound.window_start;
  const windowEnd = bound.window_end;
  const dayLabel = formatDayLabel(bound.day_label);

  const scenarioCount = await query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM scenarios
      WHERE created_at >= $1 AND created_at < $2
    `,
    [windowStart, windowEnd]
  );

  const totals = await query<{
    requests: string;
    cached_requests: string;
    unique_ips: string;
    unique_scenarios: string;
    input_tokens: string;
    output_tokens: string;
    total_tokens: string;
  }>(
    `
      SELECT
        COUNT(*)::text AS requests,
        COUNT(*) FILTER (WHERE cached)::text AS cached_requests,
        COUNT(DISTINCT ip_address)::text AS unique_ips,
        COUNT(DISTINCT scenario_id) FILTER (WHERE scenario_id IS NOT NULL)::text AS unique_scenarios,
        COALESCE(SUM(input_tokens), 0)::text AS input_tokens,
        COALESCE(SUM(output_tokens), 0)::text AS output_tokens,
        COALESCE(SUM(total_tokens), 0)::text AS total_tokens
      FROM token_usage
      WHERE created_at >= $1 AND created_at < $2
    `,
    [windowStart, windowEnd]
  );

  const byRouteRows = await query<{
    route: string;
    model: string;
    requests: string;
    cached_requests: string;
    input_tokens: string;
    output_tokens: string;
    total_tokens: string;
  }>(
    `
      SELECT
        route,
        model,
        COUNT(*)::text AS requests,
        COUNT(*) FILTER (WHERE cached)::text AS cached_requests,
        COALESCE(SUM(input_tokens), 0)::text AS input_tokens,
        COALESCE(SUM(output_tokens), 0)::text AS output_tokens,
        COALESCE(SUM(total_tokens), 0)::text AS total_tokens
      FROM token_usage
      WHERE created_at >= $1 AND created_at < $2
      GROUP BY route, model
    `,
    [windowStart, windowEnd]
  );

  const ipRows = await query<{
    ip_address: string;
    model: string;
    requests: string;
    input_tokens: string;
    output_tokens: string;
    total_tokens: string;
  }>(
    `
      SELECT
        ip_address,
        model,
        COUNT(*)::text AS requests,
        COALESCE(SUM(input_tokens), 0)::text AS input_tokens,
        COALESCE(SUM(output_tokens), 0)::text AS output_tokens,
        COALESCE(SUM(total_tokens), 0)::text AS total_tokens
      FROM token_usage
      WHERE created_at >= $1 AND created_at < $2
      GROUP BY ip_address, model
    `,
    [windowStart, windowEnd]
  );

  let pricingIncomplete = false;

  const routeMap = new Map<
    string,
    { requests: number; cachedRequests: number; totalTokens: number; costUsd: number }
  >();
  for (const row of byRouteRows.rows) {
    if (getModelPricing(row.model) === null) pricingIncomplete = true;
    const entry = routeMap.get(row.route) ?? {
      requests: 0,
      cachedRequests: 0,
      totalTokens: 0,
      costUsd: 0
    };
    entry.requests += Number(row.requests);
    entry.cachedRequests += Number(row.cached_requests);
    entry.totalTokens += Number(row.total_tokens);
    entry.costUsd += estimateCostUsd(
      row.model,
      Number(row.input_tokens),
      Number(row.output_tokens)
    );
    routeMap.set(row.route, entry);
  }

  const byRoute = [...routeMap.entries()]
    .map(([route, v]) => ({ route, ...v }))
    .sort((a, b) => b.totalTokens - a.totalTokens || b.requests - a.requests);

  const ipMap = new Map<
    string,
    { requests: number; totalTokens: number; costUsd: number }
  >();
  for (const row of ipRows.rows) {
    if (getModelPricing(row.model) === null) pricingIncomplete = true;
    const entry = ipMap.get(row.ip_address) ?? {
      requests: 0,
      totalTokens: 0,
      costUsd: 0
    };
    entry.requests += Number(row.requests);
    entry.totalTokens += Number(row.total_tokens);
    entry.costUsd += estimateCostUsd(
      row.model,
      Number(row.input_tokens),
      Number(row.output_tokens)
    );
    ipMap.set(row.ip_address, entry);
  }

  const topIps = [...ipMap.entries()]
    .map(([ipAddress, v]) => ({ ipAddress, ...v }))
    .sort((a, b) => b.totalTokens - a.totalTokens || b.requests - a.requests)
    .slice(0, 5);

  const estimatedCostUsd = byRoute.reduce((sum, row) => sum + row.costUsd, 0);

  const t = totals.rows[0];
  const requests = Number(t?.requests ?? 0);
  const cachedRequests = Number(t?.cached_requests ?? 0);

  return {
    timeZone,
    dayLabel,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    scenariosCreated: Number(scenarioCount.rows[0]?.count ?? 0),
    requests,
    cachedRequests,
    aiRequests: Math.max(0, requests - cachedRequests),
    uniqueIps: Number(t?.unique_ips ?? 0),
    uniqueScenarios: Number(t?.unique_scenarios ?? 0),
    inputTokens: Number(t?.input_tokens ?? 0),
    outputTokens: Number(t?.output_tokens ?? 0),
    totalTokens: Number(t?.total_tokens ?? 0),
    estimatedCostUsd,
    pricingIncomplete,
    byRoute,
    topIps
  };
}

export function formatUsageReportEmail(report: DailyUsageReport) {
  const cacheRate =
    report.requests > 0
      ? `${Math.round((report.cachedRequests / report.requests) * 100)}%`
      : "n/a";

  const costLabel = `${formatUsd(report.estimatedCostUsd)}${
    report.pricingIncomplete ? "+ (partial)" : ""
  }`;

  const routeLines =
    report.byRoute.length > 0
      ? report.byRoute
          .map(
            (row) =>
              `  • ${row.route}: ${row.requests} req (${row.cachedRequests} cached), ${row.totalTokens.toLocaleString()} tokens, ~${formatUsd(row.costUsd)}`
          )
          .join("\n")
      : "  • none";

  const ipLines =
    report.topIps.length > 0
      ? report.topIps
          .map(
            (row) =>
              `  • ${row.ipAddress}: ${row.requests} req, ${row.totalTokens.toLocaleString()} tokens, ~${formatUsd(row.costUsd)}`
          )
          .join("\n")
      : "  • none";

  const subject = `Riple daily usage — ${report.dayLabel}`;
  const text = `Riple daily usage report
${report.dayLabel} (${report.timeZone})

Ripples created: ${report.scenariosCreated}
API requests: ${report.requests} (${report.aiRequests} AI, ${report.cachedRequests} cached, ${cacheRate} cache rate)
Unique IPs: ${report.uniqueIps}
Scenarios touched: ${report.uniqueScenarios}

Tokens
  Input:  ${report.inputTokens.toLocaleString()}
  Output: ${report.outputTokens.toLocaleString()}
  Total:  ${report.totalTokens.toLocaleString()}

Estimated cost: ${costLabel}

By route
${routeLines}

Top IPs
${ipLines}

Window (UTC): ${report.windowStart} → ${report.windowEnd}
`;

  const html = `
    <div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#111;line-height:1.5;max-width:560px">
      <h1 style="font-size:20px;margin:0 0 4px">Riple daily usage</h1>
      <p style="margin:0 0 20px;color:#555">${report.dayLabel} · ${report.timeZone}</p>
      <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:6px 0">Ripples created</td><td style="padding:6px 0;text-align:right;font-weight:600">${report.scenariosCreated}</td></tr>
        <tr><td style="padding:6px 0">API requests</td><td style="padding:6px 0;text-align:right;font-weight:600">${report.requests}</td></tr>
        <tr><td style="padding:6px 0">AI / cached</td><td style="padding:6px 0;text-align:right;font-weight:600">${report.aiRequests} / ${report.cachedRequests} (${cacheRate})</td></tr>
        <tr><td style="padding:6px 0">Unique IPs</td><td style="padding:6px 0;text-align:right;font-weight:600">${report.uniqueIps}</td></tr>
        <tr><td style="padding:6px 0">Total tokens</td><td style="padding:6px 0;text-align:right;font-weight:600">${report.totalTokens.toLocaleString()}</td></tr>
        <tr><td style="padding:6px 0">Estimated cost</td><td style="padding:6px 0;text-align:right;font-weight:600">${costLabel}</td></tr>
      </table>
      <h2 style="font-size:15px;margin:0 0 8px">By route</h2>
      <pre style="background:#f4f4f5;padding:12px;border-radius:8px;font-size:12px;white-space:pre-wrap">${routeLines}</pre>
      <h2 style="font-size:15px;margin:16px 0 8px">Top IPs</h2>
      <pre style="background:#f4f4f5;padding:12px;border-radius:8px;font-size:12px;white-space:pre-wrap">${ipLines}</pre>
    </div>
  `;

  return { subject, text, html };
}
