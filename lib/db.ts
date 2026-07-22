import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __riplePgPool: Pool | undefined;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getPool() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!global.__riplePgPool) {
    global.__riplePgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000
    });
  }

  return global.__riplePgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return getPool().query<T>(text, params);
}

let schemaReady: Promise<void> | null = null;

export async function ensureSchema() {
  if (!isDatabaseConfigured()) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS scenarios (
          id TEXT PRIMARY KEY,
          prompt TEXT NOT NULL,
          depth TEXT NOT NULL DEFAULT 'standard',
          prompt_hash TEXT,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await query(`
        ALTER TABLE scenarios
        ADD COLUMN IF NOT EXISTS prompt_hash TEXT;
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS scenarios_updated_at_idx
        ON scenarios (updated_at DESC);
      `);
      await query(`
        CREATE UNIQUE INDEX IF NOT EXISTS scenarios_prompt_hash_uidx
        ON scenarios (prompt_hash)
        WHERE prompt_hash IS NOT NULL;
      `);
      await query(`
        CREATE TABLE IF NOT EXISTS token_usage (
          id BIGSERIAL PRIMARY KEY,
          scenario_id TEXT,
          ip_address TEXT NOT NULL,
          route TEXT NOT NULL,
          model TEXT NOT NULL DEFAULT '',
          input_tokens INTEGER NOT NULL DEFAULT 0,
          output_tokens INTEGER NOT NULL DEFAULT 0,
          total_tokens INTEGER NOT NULL DEFAULT 0,
          cached BOOLEAN NOT NULL DEFAULT FALSE,
          request_id TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS token_usage_scenario_id_idx
        ON token_usage (scenario_id);
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS token_usage_ip_created_idx
        ON token_usage (ip_address, created_at DESC);
      `);
      await query(`
        CREATE TABLE IF NOT EXISTS ip_token_totals (
          ip_address TEXT PRIMARY KEY,
          total_input_tokens BIGINT NOT NULL DEFAULT 0,
          total_output_tokens BIGINT NOT NULL DEFAULT 0,
          total_tokens BIGINT NOT NULL DEFAULT 0,
          request_count BIGINT NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}
