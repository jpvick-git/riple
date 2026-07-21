/** Browser-safe slug helper (no Node crypto). */
export function createSlug(question: string) {
  return (
    question
      .toLowerCase()
      .replace(/^what if\s+/i, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "new-riple"
  );
}
