const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "ref",
  "ref_src"
]);

/** Markdown-style links and bare URLs that should never appear in prose. */
const INLINE_LINK_PATTERN =
  /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s)\]>"']+/gi;

export function stripTrackingParams(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith("utm_")) {
        parsed.searchParams.delete(key);
      }
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function stripInlineLinks(text: string): string {
  return text
    .replace(INLINE_LINK_PATTERN, (_match, label?: string) => {
      if (typeof label === "string" && label.trim()) {
        return label.replace(/^source\.?/i, "").trim() || "";
      }
      return "";
    })
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

export function sanitizeProse(value: string): string {
  return stripInlineLinks(value)
    .replace(/\*\*?|__|`+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sanitizeStringList(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => sanitizeProse(value))
    .filter((value) => value.length > 0);
}

export function normalizeSourceUrl(url: string): string {
  const cleaned = stripTrackingParams(url.trim());
  if (!cleaned) return "";
  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}
