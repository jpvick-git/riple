import { createHash, randomUUID } from "crypto";
import OpenAI from "openai";

export function getFastModel() {
  return process.env.OPENAI_FAST_MODEL || process.env.OPENAI_MODEL || "gpt-5-mini";
}

export function getDeepModel() {
  return process.env.OPENAI_DEEP_MODEL || process.env.OPENAI_MODEL || "gpt-5-mini";
}

export function createOpenAIClient(timeoutMs: number) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: timeoutMs
  });
}

export function createRequestId() {
  return randomUUID().slice(0, 8);
}

export function createSlug(question: string) {
  return (
    question
      .toLowerCase()
      .replace(/^what if\s+/i, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "new-ripple"
  );
}

export function normalizePromptForCache(prompt: string) {
  return prompt.trim().replace(/\s+/g, " ").toLowerCase();
}

export function hashPrompt(prompt: string, depth: string) {
  return createHash("sha256")
    .update(`${depth}::${normalizePromptForCache(prompt)}`)
    .digest("hex")
    .slice(0, 24);
}

export function extractOutputText(response: {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
}): string {
  if (response.output_text?.trim()) {
    return response.output_text.trim();
  }

  const chunks: string[] = [];
  for (const item of response.output ?? []) {
    if (item.type !== "message" || !item.content) continue;
    for (const part of item.content) {
      if ((part.type === "output_text" || part.type === "text") && part.text) {
        chunks.push(part.text);
      }
    }
  }

  return chunks.join("\n").trim();
}

export function isTimeoutError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/timeout|timed out|abort/i.test(message)) return true;
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    String((error as { code?: string }).code).toLowerCase().includes("timeout")
  ) {
    return true;
  }
  return false;
}

export function logGeneration(meta: {
  route: string;
  requestId: string;
  model: string;
  durationMs: number;
  success: boolean;
  timedOut?: boolean;
  events?: number;
  outputChars?: number;
}) {
  const duration = `${(meta.durationMs / 1000).toFixed(1)}s`;
  console.info(
    `[${meta.route}] request=${meta.requestId} model=${meta.model} duration=${duration} events=${meta.events ?? "-"} outputChars=${meta.outputChars ?? "-"} timedOut=${Boolean(meta.timedOut)} success=${meta.success}`
  );
}

export async function createStructuredResponse<T>({
  route,
  model,
  timeoutMs,
  schemaName,
  schema,
  system,
  user,
  tools
}: {
  route: string;
  model: string;
  timeoutMs: number;
  schemaName: string;
  schema: Record<string, unknown>;
  system: string;
  user: string;
  tools?: Array<{ type: "web_search" }>;
}): Promise<{ data: T; requestId: string; outputText: string; durationMs: number }> {
  const requestId = createRequestId();
  const started = Date.now();
  const client = createOpenAIClient(timeoutMs);

  try {
    const response = await client.responses.create({
      model,
      store: false,
      ...(tools?.length ? { tools } : {}),
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema
        }
      },
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        { role: "user", content: [{ type: "input_text", text: user }] }
      ]
    });

    const outputText = extractOutputText(response);
    if (!outputText) {
      throw new Error("The AI returned an empty response.");
    }

    const data = JSON.parse(outputText) as T;
    const durationMs = Date.now() - started;
    logGeneration({
      route,
      requestId,
      model,
      durationMs,
      success: true,
      outputChars: outputText.length
    });

    return { data, requestId, outputText, durationMs };
  } catch (error) {
    logGeneration({
      route,
      requestId,
      model,
      durationMs: Date.now() - started,
      success: false,
      timedOut: isTimeoutError(error)
    });
    throw error;
  }
}
