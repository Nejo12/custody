import type { NeutralizeRequest, NeutralizeResponse } from "@/types/ai";
import { anonymizeText } from "@/lib/anonymize";
import { getClientKey, rateLimit, rateLimitResponse } from "@/lib/ratelimit";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  const base =
    process.env.OPENAI_API_BASE || process.env.AI_API_BASE || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini";
  try {
    const key = getClientKey(req, "ai:neutralize");
    const rl = await rateLimit(key, 20, 60_000);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    const body = (await req.json()) as NeutralizeRequest;
    const tone = body.tone || "neutral";
    const locale = body.locale || "de";

    if (!apiKey) {
      const text = anonymizeText(body.text || "").replace(/!+/g, ".");
      const res: NeutralizeResponse = { text };
      return new Response(JSON.stringify(res), {
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }

    const prompt = [
      "Rewrite the following into a facts-first, non-accusatory letter suitable for a mediator or the other parent.",
      `Tone: ${tone}. Locale: ${locale}. Keep dates/facts. No legal advice.`,
      anonymizeText(body.text || ""),
      "Return strict JSON: { text }",
    ].join("\n");
    const r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Return only JSON: {text}." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });
    if (!r.ok) return new Response(JSON.stringify({ error: "AI request failed" }), { status: 502 });
    const data = await r.json();
    const content: string = data?.choices?.[0]?.message?.content || "";
    try {
      const parsed = JSON.parse(content) as NeutralizeResponse;
      if (!parsed || typeof parsed.text !== "string") throw new Error("bad");
      return new Response(JSON.stringify(parsed), {
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    } catch {
      return new Response(JSON.stringify({ error: "Invalid AI output" }), { status: 502 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
