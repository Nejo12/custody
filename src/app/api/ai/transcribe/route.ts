import type { NextRequest } from "next/server";
import { anonymizeText } from "@/lib/anonymize";
import { getClientKey, rateLimit, rateLimitResponse } from "@/lib/ratelimit";

export const runtime = "nodejs";

type TranscribeResult = {
  text: string;
  language?: string;
  translations?: { en?: string; de?: string };
  disabled?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const key = getClientKey(req as unknown as Request, "ai:transcribe");
    const rl = rateLimit(key, 15, 60_000);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    const form = await req.formData();
    const file = form.get("audio");
    const target = (form.get("target") as string | null) || "both"; // en | de | both

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing audio file" }), { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    const base =
      process.env.OPENAI_API_BASE || process.env.AI_API_BASE || "https://api.openai.com/v1";
    const transcribeModel =
      process.env.OPENAI_TRANSCRIBE_MODEL ||
      process.env.AI_TRANSCRIBE_MODEL ||
      "gpt-4o-mini-transcribe";
    const chatModel = process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      const res: TranscribeResult = {
        text: "",
        language: "unknown",
        translations: {},
        disabled: true,
      };
      return new Response(JSON.stringify(res), {
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }

    // Build multipart body to call OpenAI transcriptions
    const fd = new FormData();
    fd.append("file", file, file.name || "audio.webm");
    fd.append("model", transcribeModel);
    // Optional: guidance
    fd.append("prompt", "Transcribe clearly. Return plain text.");

    const r = await fetch(`${base}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: fd,
    });
    if (!r.ok) {
      const msg = await r.text();
      return new Response(JSON.stringify({ error: `Transcribe failed: ${msg}` }), { status: 502 });
    }
    const j = (await r.json()) as { text?: string; language?: string };
    const transcribed = (j.text || "").trim();
    const language = j.language || undefined;

    const result: TranscribeResult = { text: transcribed, language, translations: {} };

    async function translate(to: "en" | "de"): Promise<string> {
      const prompt = [
        `Translate the following text to ${to.toUpperCase()}. Return only the translated text.`,
        anonymizeText(transcribed),
      ].join("\n\n");
      const rr = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: chatModel,
          messages: [
            { role: "system", content: "Return only the translation with no extra text." },
            { role: "user", content: prompt },
          ],
          temperature: 0,
        }),
      });
      if (!rr.ok) return transcribed;
      const data = await rr.json();
      const content: string = data?.choices?.[0]?.message?.content || transcribed;
      return content.trim();
    }

    if (target === "en" || target === "both") {
      result.translations!.en = await translate("en");
    }
    if (target === "de" || target === "both") {
      result.translations!.de = await translate("de");
    }

    return new Response(JSON.stringify(result), {
      headers: rateLimitResponse(rl.remaining, rl.resetAt),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
