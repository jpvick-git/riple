import { NextResponse } from "next/server";
import { isDatabaseConfigured, query } from "@/lib/db";

/**
 * Lightweight per-IP throttle to protect the OpenAI bill from a single
 * abuser/bot. Two independent guards:
 *   1. Sliding request window (in-process; single PM2 instance).
 *   2. Daily total-token cap per IP (read from token_usage in Postgres).
 * Neither is a substitute for a real distributed limiter, but both are cheap
 * and stop the obvious "hammer /api/generate" case.
 */

const WINDOW_MS = 5 * 60_000;
const MAX_REQUESTS = readIntEnv("RATE_LIMIT_MAX_REQUESTS", 20);
const DAILY_TOKEN_CAP = readIntEnv("RATE_LIMIT_DAILY_TOKENS", 150_000);

/** Prune stale IP buckets occasionally so the map can't grow unbounded. */
const PRUNE_EVERY = 500;

const buckets = new Map<string, number[]>();
let callsSincePrune = 0;

function readIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: "requests" | "tokens"; retryAfterSeconds: number };

function secondsUntilMidnightUtc(now: number): number {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((next.getTime() - now) / 1000));
}

function pruneStale(now: number) {
  for (const [ip, hits] of buckets) {
    if (hits.every((t) => now - t >= WINDOW_MS)) buckets.delete(ip);
  }
}

/** Enforce the request window, then (if configured) the daily token cap. */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const key = ip.slice(0, 64);
  const now = Date.now();

  if (++callsSincePrune >= PRUNE_EVERY) {
    callsSincePrune = 0;
    pruneStale(now);
  }

  const recent = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (MAX_REQUESTS > 0 && recent.length >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((WINDOW_MS - (now - recent[0])) / 1000)
    );
    buckets.set(key, recent);
    return { ok: false, reason: "requests", retryAfterSeconds };
  }

  recent.push(now);
  buckets.set(key, recent);

  if (DAILY_TOKEN_CAP > 0 && isDatabaseConfigured()) {
    try {
      const { rows } = await query<{ total: string | number }>(
        `SELECT COALESCE(SUM(total_tokens), 0) AS total
           FROM token_usage
          WHERE ip_address = $1
            AND created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC')`,
        [key]
      );
      const usedToday = Number(rows[0]?.total ?? 0);
      if (usedToday >= DAILY_TOKEN_CAP) {
        return {
          ok: false,
          reason: "tokens",
          retryAfterSeconds: secondsUntilMidnightUtc(now)
        };
      }
    } catch (error) {
      // Never let the limiter's own failure block legitimate traffic.
      console.error("Rate limit token check failed:", error);
    }
  }

  return { ok: true };
}

/** Standard 429 response for a failed rate-limit check. */
export function rateLimitResponse(result: Extract<RateLimitResult, { ok: false }>) {
  const message =
    result.reason === "tokens"
      ? "Daily generation limit reached for your network. Try again tomorrow."
      : "Too many requests. Please slow down and try again shortly.";

  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) }
    }
  );
}
