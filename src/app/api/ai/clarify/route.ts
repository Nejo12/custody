import type { ClarifyRequest, ClarifyResponse } from "@/types/ai";
import { anonymizeObject, anonymizeText } from "@/lib/anonymize";
import { getClientKey, rateLimit, rateLimitResponse } from "@/lib/ratelimit";

function buildPrompt(req: ClarifyRequest): string {
  const q = req.questionText || req.questionId;
  const ans = JSON.stringify(req.answers);
  const locale = req.locale || "de";
  const help = req.context || "";
  const localeMap: Record<string, string> = {
    de: "German",
    en: "English",
    ar: "Arabic",
    fr: "French",
    pl: "Polish",
    ru: "Russian",
    tr: "Turkish",
  };
  const language = localeMap[locale] || "German";
  return [
    "You are an assistant for a custody/contact rights interview in Germany.",
    "Task: given the current question and prior structured answers, propose the most likely structured answer and one short follow-up question to clarify uncertainty.",
    "Never provide legal advice. Keep it concise and neutral.",
    `IMPORTANT: Respond in ${language} language. All text output (followup, reasoning) must be in ${language}.`,
    `Locale: ${locale}`,
    `Question: ${q}`,
    `Answers: ${ans}`,
    help ? `Context: ${help}` : "",
    "Output strictly as JSON with keys: suggestion (yes|no|unsure), confidence (0..1), followup (optional, short, in the user's language), reasoning (optional, one sentence, in the user's language).",
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
      const locale = body.locale || "de";
      const fallbackMessages: Record<
        string,
        { withQuestion: (q: string) => string; withoutQuestion: string }
      > = {
        de: {
          withQuestion: (q: string) => `Können Sie genauer sagen: ${q}?`,
          withoutQuestion: "Bitte prüfen Sie die Hilfe und Quellen.",
        },
        en: {
          withQuestion: (q: string) => `Can you be more specific: ${q}?`,
          withoutQuestion: "Please check the help and sources.",
        },
        ar: {
          withQuestion: (q: string) => `هل يمكنك أن تكون أكثر تحديداً: ${q}؟`,
          withoutQuestion: "يرجى التحقق من المساعدة والمصادر.",
        },
        fr: {
          withQuestion: (q: string) => `Pouvez-vous être plus précis : ${q} ?`,
          withoutQuestion: "Veuillez consulter l'aide et les sources.",
        },
        pl: {
          withQuestion: (q: string) => `Czy możesz być bardziej szczegółowy: ${q}?`,
          withoutQuestion: "Proszę sprawdzić pomoc i źródła.",
        },
        ru: {
          withQuestion: (q: string) => `Можете ли вы быть более конкретным: ${q}?`,
          withoutQuestion: "Пожалуйста, проверьте справку и источники.",
        },
        tr: {
          withQuestion: (q: string) => `Daha spesifik olabilir misiniz: ${q}?`,
          withoutQuestion: "Lütfen yardım ve kaynakları kontrol edin.",
        },
      };
      const messages = fallbackMessages[locale] || fallbackMessages.de;
      const suggestion: ClarifyResponse = {
        suggestion: "unsure",
        confidence: 0.35,
        followup: body.questionText
          ? messages.withQuestion(body.questionText)
          : messages.withoutQuestion,
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
      const locale = safe.locale || "de";
      const fallbackFollowups: Record<string, string> = {
        de: "Bitte prüfen Sie die Hilfe.",
        en: "Please check the help.",
        ar: "يرجى التحقق من المساعدة.",
        fr: "Veuillez consulter l'aide.",
        pl: "Proszę sprawdzić pomoc.",
        ru: "Пожалуйста, проверьте справку.",
        tr: "Lütfen yardımı kontrol edin.",
      };
      const fallback: ClarifyResponse = {
        suggestion: "unsure",
        confidence: 0.5,
        followup: fallbackFollowups[locale] || fallbackFollowups.de,
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
