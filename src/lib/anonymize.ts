export function anonymizeText(text: string): string {
  if (!text) return text;
  let out = text;
  // Emails
  out = out.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]");
  // Phone numbers (basic)
  out = out.replace(/\+?\d[\d\s().-]{6,}\d/g, "[REDACTED_PHONE]");
  // Street addresses (German common patterns)
  out = out.replace(
    /\b([A-ZÄÖÜ][a-zäöüß]+(?:\s|-)?(?:straße|str\.|weg|platz|allee|chaussee))\s?\d+[A-Za-z]?\b/gi,
    "[REDACTED_ADDRESS]"
  );
  // Postcodes
  out = out.replace(/\b\d{5}\b/g, "[REDACTED_POSTCODE]");
  // Names: sequences of 2+ capitalized words (rough heuristic)
  out = out.replace(/\b([A-ZÄÖÜ][a-zäöüß]+\s+){1,3}[A-ZÄÖÜ][a-zäöüß]+\b/g, "[REDACTED_NAME]");
  return out;
}

export function anonymizeObject(obj: unknown): unknown {
  if (obj == null) return obj;
  if (typeof obj === "string") return anonymizeText(obj);
  if (Array.isArray(obj)) return obj.map(anonymizeObject);
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = anonymizeObject(v);
    }
    return out;
  }
  return obj;
}
