/** Opaque 64-char hex id — not derived from the prompt, so URLs can't be guessed. */
export function createScenarioId() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
