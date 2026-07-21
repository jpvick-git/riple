import { ensureSchema, isDatabaseConfigured, query } from "@/lib/db";
import type { Scenario } from "@/lib/types";

export async function saveScenario(scenario: Scenario): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await ensureSchema();

  await query(
    `
      INSERT INTO scenarios (id, prompt, depth, data, created_at, updated_at)
      VALUES ($1, $2, $3, $4::jsonb, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        prompt = EXCLUDED.prompt,
        depth = EXCLUDED.depth,
        data = EXCLUDED.data,
        updated_at = NOW()
    `,
    [scenario.id, scenario.prompt, scenario.depth, JSON.stringify(scenario)]
  );
}

export async function getScenarioById(id: string): Promise<Scenario | null> {
  if (!isDatabaseConfigured()) return null;
  await ensureSchema();

  const result = await query<{ data: Scenario }>(
    `SELECT data FROM scenarios WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0]?.data ?? null;
}
