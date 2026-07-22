import { ensureSchema, isDatabaseConfigured, query } from "@/lib/db";
import { hashPrompt } from "@/lib/openai";
import type { Scenario } from "@/lib/types";

type ScenarioRow = {
  id: string;
  prompt: string;
  depth: string;
  prompt_hash: string | null;
  data: Scenario;
};

async function backfillPromptHash(row: ScenarioRow): Promise<Scenario> {
  const scenario = { ...row.data, id: row.id };
  if (row.prompt_hash) return scenario;

  const prompt = scenario.prompt || row.prompt;
  const depth = scenario.depth || row.depth || "standard";
  const promptHash = hashPrompt(prompt, depth);

  try {
    await query(
      `
        UPDATE scenarios
        SET prompt_hash = $1
        WHERE id = $2 AND prompt_hash IS NULL
      `,
      [promptHash, row.id]
    );
  } catch (error) {
    console.error("Failed to backfill prompt_hash:", error);
  }

  return scenario;
}

export async function saveScenario(scenario: Scenario): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await ensureSchema();

  const promptHash = hashPrompt(scenario.prompt, scenario.depth);
  const existingByHash = await getScenarioByPromptHash(promptHash);
  const id = existingByHash?.id ?? scenario.id;
  const toSave: Scenario = { ...scenario, id };

  await query(
    `
      INSERT INTO scenarios (id, prompt, depth, prompt_hash, data, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5::jsonb, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        prompt = EXCLUDED.prompt,
        depth = EXCLUDED.depth,
        prompt_hash = EXCLUDED.prompt_hash,
        data = EXCLUDED.data,
        updated_at = NOW()
    `,
    [toSave.id, toSave.prompt, toSave.depth, promptHash, JSON.stringify(toSave)]
  );
}

export async function getScenarioById(id: string): Promise<Scenario | null> {
  if (!isDatabaseConfigured()) return null;
  await ensureSchema();

  const result = await query<ScenarioRow>(
    `SELECT id, prompt, depth, prompt_hash, data FROM scenarios WHERE id = $1 LIMIT 1`,
    [id]
  );

  const row = result.rows[0];
  if (!row) return null;
  return backfillPromptHash(row);
}

export async function getScenarioByPromptHash(promptHash: string): Promise<Scenario | null> {
  if (!isDatabaseConfigured()) return null;
  await ensureSchema();

  const result = await query<ScenarioRow>(
    `
      SELECT id, prompt, depth, prompt_hash, data
      FROM scenarios
      WHERE prompt_hash = $1
      LIMIT 1
    `,
    [promptHash]
  );

  const row = result.rows[0];
  if (row) return { ...row.data, id: row.id };

  // Fallback for rows not yet backfilled: scan recent rows (small corpora).
  const legacy = await query<ScenarioRow>(
    `
      SELECT id, prompt, depth, prompt_hash, data
      FROM scenarios
      WHERE prompt_hash IS NULL
      ORDER BY updated_at DESC
      LIMIT 200
    `
  );

  for (const candidate of legacy.rows) {
    const prompt = candidate.data.prompt || candidate.prompt;
    const depth = candidate.data.depth || candidate.depth || "standard";
    if (hashPrompt(prompt, depth) !== promptHash) continue;
    return backfillPromptHash(candidate);
  }

  return null;
}
