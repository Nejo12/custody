import type { NextRequest } from "next/server";
import { anonymizeText } from "@/lib/anonymize";
import { getClientKey, rateLimit, rateLimitResponse } from "@/lib/ratelimit";

export const runtime = "nodejs";

type TranslateRequest = {
  text?: string;
  to?: string; // de|en|pl|tr|ru|ar
  transliterate?: boolean;
};

export async function POST(req: Request | NextRequest) {
  try {
    const key = getClientKey(req as Request, "ai:translate");
    const rl = rateLimit(key, 30, 60_000);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    const body = (await (req as Request).json()) as TranslateRequest;
    const text = (body.text || "").toString();
    const to = (body.to || "de").toString();
    const transliterate = !!body.transliterate;

    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    const base =
      process.env.OPENAI_API_BASE || process.env.AI_API_BASE || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return new Response(JSON.stringify({ text, transliteration: "", disabled: true }), {
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }

    const sys = [
      "You translate short phone scripts for contacting Jugendamt/court registries.",
      "Keep meaning intact, tone calm and polite, and avoid extraneous text.",
      "Return JSON with keys: text (translated), transliteration (if requested; else empty string).",
    ].join("\n");
    const prompt = [
      `Target language: ${to}`,
      transliterate
        ? "Also include a simple Latin transliteration for non‑Latin scripts (e.g., Arabic, Cyrillic)."
        : "",
      "Source:",
      anonymizeText(text),
      "Return strictly JSON with keys: text, transliteration.",
    ].join("\n\n");

    const r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: prompt },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) {
      const msg = await r.text();
      return new Response(JSON.stringify({ error: `Translate failed: ${msg}` }), { status: 502 });
    }
    const j = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = j?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content) as { text?: string; transliteration?: string };
    return new Response(
      JSON.stringify({ text: parsed.text || text, transliteration: parsed.transliteration || "" }),
      { headers: rateLimitResponse(rl.remaining, rl.resetAt) }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
