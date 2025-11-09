import type { ClarifyRequest, ClarifyResponse } from "@/types/ai";
import { anonymizeObject, anonymizeText } from "@/lib/anonymize";
import { getClientKey, rateLimit, rateLimitResponse } from "@/lib/ratelimit";

function buildPrompt(req: ClarifyRequest): string {
  const q = req.questionText || req.questionId;
  const ans = JSON.stringify(req.answers);
  const locale = req.locale || "de";
  const help = req.context || "";
  return [
    "You are an assistant for a custody/contact rights interview in Germany.",
    "Task: given the current question and prior structured answers, propose the most likely structured answer and one short follow-up question to clarify uncertainty.",
    "Never provide legal advice. Keep it concise and neutral.",
    `Locale: ${locale}`,
    `Question: ${q}`,
    `Answers: ${ans}`,
    help ? `Context: ${help}` : "",
    "Output strictly as JSON with keys: suggestion (yes|no|unsure), confidence (0..1), followup (optional, short), reasoning (optional, one sentence).",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(req: Request) {
  try {
    const key = getClientKey(req, "ai:clarify");
    const rl = await rateLimit(key, 20, 60_000);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    const body = (await req.json()) as ClarifyRequest;
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    const base =
      process.env.OPENAI_API_BASE || process.env.AI_API_BASE || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini";

    // Fallback stub if no key configured
    if (!apiKey) {
      const suggestion: ClarifyResponse = {
        suggestion: "unsure",
        confidence: 0.35,
        followup: body.questionText
          ? `Können Sie genauer sagen: ${body.questionText}?`
          : "Bitte prüfen Sie die Hilfe und Quellen.",
        reasoning: "No external AI configured; returning conservative default.",
      };
      return new Response(JSON.stringify(suggestion), {
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }

    // Anonymize user-provided fields before sending to external API
    const safe: ClarifyRequest = {
      questionId: anonymizeText(body.questionId || ""),
      questionText: body.questionText ? anonymizeText(body.questionText) : undefined,
      answers: anonymizeObject(body.answers) as Record<string, string>,
      locale: body.locale,
      context: body.context ? anonymizeText(body.context) : undefined,
    };
    const prompt = buildPrompt(safe);
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You return only strict JSON. No prose." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: "AI request failed", detail: text }), {
        status: 502,
      });
    }
    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content || "";
    let parsed: ClarifyResponse | null = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      /* ignore */
    }
    if (!parsed || typeof parsed.suggestion !== "string" || typeof parsed.confidence !== "number") {
      const fallback: ClarifyResponse = {
        suggestion: "unsure",
        confidence: 0.5,
        followup: "Bitte prüfen Sie die Hilfe.",
        reasoning: "Unparsable model output.",
      };
      return new Response(JSON.stringify(fallback), {
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));
    if (!["yes", "no", "unsure"].includes(parsed.suggestion)) parsed.suggestion = "unsure";
    return new Response(JSON.stringify(parsed), {
      headers: rateLimitResponse(rl.remaining, rl.resetAt),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
