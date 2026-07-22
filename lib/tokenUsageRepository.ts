import { ensureSchema, isDatabaseConfigured, query } from "@/lib/db";
import type { TokenUsage } from "@/lib/openai";

export type TokenUsageRoute =
  | "foundation"
  | "event-details"
  | "conclusion"
  | "sources";

export type TokenUsageRecord = {
  scenarioId?: string | null;
  ipAddress: string;
  route: TokenUsageRoute;
  model: string;
  usage: TokenUsage;
  cached?: boolean;
  requestId?: string | null;
};

export async function recordTokenUsage(record: TokenUsageRecord): Promise<void> {
  if (!isDatabaseConfigured()) return;

  const inputTokens = record.usage.inputTokens || 0;
  const outputTokens = record.usage.outputTokens || 0;
  const totalTokens = record.usage.totalTokens || inputTokens + outputTokens;

  // Still count the request even when usage is missing (e.g. empty/cached oddities)
  await ensureSchema();

  await query(
    `
      INSERT INTO token_usage (
        scenario_id,
        ip_address,
        route,
        model,
        input_tokens,
        output_tokens,
        total_tokens,
        cached,
        request_id,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `,
    [
      record.scenarioId || null,
      record.ipAddress.slice(0, 64),
      record.route,
      record.model.slice(0, 80),
      inputTokens,
      outputTokens,
      totalTokens,
      Boolean(record.cached),
      record.requestId || null
    ]
  );

  await query(
    `
      INSERT INTO ip_token_totals (
        ip_address,
        total_input_tokens,
        total_output_tokens,
        total_tokens,
        request_count,
        updated_at
      )
      VALUES ($1, $2, $3, $4, 1, NOW())
      ON CONFLICT (ip_address) DO UPDATE SET
        total_input_tokens = ip_token_totals.total_input_tokens + EXCLUDED.total_input_tokens,
        total_output_tokens = ip_token_totals.total_output_tokens + EXCLUDED.total_output_tokens,
        total_tokens = ip_token_totals.total_tokens + EXCLUDED.total_tokens,
        request_count = ip_token_totals.request_count + 1,
        updated_at = NOW()
    `,
    [record.ipAddress.slice(0, 64), inputTokens, outputTokens, totalTokens]
  );
}
