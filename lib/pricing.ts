/**
 * Approximate OpenAI pricing (USD per 1M tokens) used only for internal
 * cost-estimate reporting. Update these as OpenAI changes pricing. Models not
 * listed here contribute 0 to the estimate and flip the "pricing incomplete"
 * flag so the report can flag that the number is a lower bound.
 */
export type ModelPricing = {
  inputPerMillion: number;
  outputPerMillion: number;
};

const MODEL_PRICING: Record<string, ModelPricing> = {
  "gpt-5": { inputPerMillion: 1.25, outputPerMillion: 10.0 },
  "gpt-5-mini": { inputPerMillion: 0.25, outputPerMillion: 2.0 },
  "gpt-5-nano": { inputPerMillion: 0.05, outputPerMillion: 0.4 },
  "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gpt-4.1": { inputPerMillion: 2.0, outputPerMillion: 8.0 },
  "gpt-4.1-mini": { inputPerMillion: 0.4, outputPerMillion: 1.6 }
};

/**
 * Returns pricing for a model, {0,0} for cache hits (no real tokens), or null
 * when the model is unknown (so callers can flag an incomplete estimate).
 */
export function getModelPricing(model: string): ModelPricing | null {
  if (!model || model === "cache") {
    return { inputPerMillion: 0, outputPerMillion: 0 };
  }
  return MODEL_PRICING[model] ?? null;
}

export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = getModelPricing(model);
  if (!pricing) return 0;
  return (
    (inputTokens / 1_000_000) * pricing.inputPerMillion +
    (outputTokens / 1_000_000) * pricing.outputPerMillion
  );
}

export function formatUsd(amount: number): string {
  if (amount <= 0) return "$0.00";
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(2)}`;
}
