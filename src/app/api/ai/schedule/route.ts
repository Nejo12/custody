import type { ScheduleSuggestRequest, ScheduleSuggestResponse } from "@/types/ai";
import { anonymizeText } from "@/lib/anonymize";

function buildPrompt(body: ScheduleSuggestRequest): string {
  const parts = [
    "You are an assistant creating a practical contact/visitation schedule in Germany.",
    "Given constraints, propose a realistic weekly plan and handover rules.",
    "Return strict JSON with keys: weekday (object of day->range like '16:00-19:00'), weekend (even/odd), handover (location, notes), summary (one sentence).",
    `Locale: ${body.locale || "de"}`,
    `Distance: ${body.distance}`,
    `ChildUnderThree: ${body.childUnderThree ? "yes" : "no"}`,
    body.city ? `Region: ${body.city}` : "",
    body.courtName ? `Court: ${body.courtName}` : "",
    body.workHours ? `WorkHours: ${anonymizeText(body.workHours)}` : "",
    body.specialNotes ? `Notes: ${anonymizeText(body.specialNotes)}` : "",
  ].filter(Boolean);
  return parts.join("\n");
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  const base =
    process.env.OPENAI_API_BASE || process.env.AI_API_BASE || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini";
  try {
    const body = (await req.json()) as ScheduleSuggestRequest;

    if (!apiKey) {
      // Simple heuristic fallback
      const localWeek = body.childUnderThree
        ? { tuesday: "16:00-18:00", thursday: "16:00-18:00", saturday: "09:00-12:00" }
        : { wednesday: "16:00-19:00", friday: "16:00-19:00", sunday: "10:00-18:00" };
      const regional = { friday: "18:00-20:00", saturday: "10:00-18:00", sunday: "10:00-16:00" };
      const far = { saturday: "10:00-18:00", sunday: "10:00-18:00" };
      const weekday =
        body.distance === "local" ? localWeek : body.distance === "regional" ? regional : far;
      const res: ScheduleSuggestResponse = {
        weekday,
        weekend:
          body.distance === "far" ? { even: "Fri 18:00 - Sun 18:00" } : { even: "—", odd: "—" },
        handover: {
          location: "Outside home / public place",
          notes: "Be punctual; share delays by text.",
        },
        summary:
          body.distance === "far"
            ? "Longer weekend blocks to reduce travel burden."
            : body.childUnderThree
              ? "Short weekday windows with a short weekend morning."
              : "Balanced weekday and weekend time.",
      };
      return Response.json(res);
    }

    const prompt = buildPrompt(body);
    const r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Return only strict JSON with the requested keys." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });
    if (!r.ok) return new Response(JSON.stringify({ error: "AI request failed" }), { status: 502 });
    const data = await r.json();
    const content: string = data?.choices?.[0]?.message?.content || "";
    let parsed: ScheduleSuggestResponse | null = null;
    try {
      parsed = JSON.parse(content) as ScheduleSuggestResponse;
    } catch {
      /* ignore */
    }
    if (!parsed || typeof parsed !== "object") {
      return new Response(JSON.stringify({ error: "Invalid AI output" }), { status: 502 });
    }
    return Response.json(parsed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
