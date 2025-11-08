import type { SummarizeRequest, SummarizeResponse, TimelineItem } from "@/types/ai";
import { getClientKey, rateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { anonymizeText } from "@/lib/anonymize";

function heuristicSummarize(text: string): TimelineItem[] {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const items: TimelineItem[] = [];
  const month =
    "(?:Jan(?:uar)?|Feb(?:ruar)?|M(?:ä|a)rz|Apr(?:il)?|May|Mai|Jun(?:i)?|Jul(?:i)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Okt(?:ober)?|Oct(?:ober)?|Nov(?:ember)?|Dez(?:ember)?|Dec(?:ember)?)";
  const dateRe = new RegExp(
    `((?:\\d{4}-\\d{2}-\\d{2})|(?:\\d{1,2}[./]\\d{1,2}[./]\\d{2,4})|(?:\\d{1,2}\\s${month}\\s\\d{2,4})|(?:${month}\\s\\d{1,2},?\\s\\d{2,4}))`,
    "i"
  );
  for (const line of lines) {
    const m = line.match(dateRe);
    items.push({ date: m ? m[1] : undefined, text: anonymizeText(line) });
  }
  return items.slice(0, 30);
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  const base =
    process.env.OPENAI_API_BASE || process.env.AI_API_BASE || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini";
  try {
    const key = getClientKey(req, "ai:summarize");
    const rl = rateLimit(key, 20, 60_000);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    const body = (await req.json()) as SummarizeRequest;
    const locale = body.locale || "de";
    if (!apiKey) {
      const items = heuristicSummarize(body.text || "");
      const res: SummarizeResponse = { items, notes: "Heuristic summary (no external AI)." };
      return new Response(JSON.stringify(res), {
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    const prompt = [
      "You extract a facts-only custody/contact timeline.",
      "Given raw pasted chats/notes, output strict JSON: { items: [{date?, text}], notes? }.",
      "Keep it neutral, leave out feelings/opinions; keep at most 20 items.",
      `Locale: ${locale}`,
      anonymizeText(body.text || ""),
    ].join("\n");
    const r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "Return only strict JSON matching {items:[{date?,text}],notes?}.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
    });
    if (!r.ok) return new Response(JSON.stringify({ error: "AI request failed" }), { status: 502 });
    const data = await r.json();
    const content: string = data?.choices?.[0]?.message?.content || "";
    let parsed: SummarizeResponse | null = null;
    try {
      parsed = JSON.parse(content) as SummarizeResponse;
    } catch {
      /* ignore */
    }
    if (!parsed || !Array.isArray(parsed.items)) {
      const items = heuristicSummarize(body.text || "");
      const res: SummarizeResponse = { items, notes: "Fallback heuristic summary." };
      return new Response(JSON.stringify(res), {
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    return new Response(JSON.stringify(parsed), {
      headers: rateLimitResponse(rl.remaining, rl.resetAt),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
