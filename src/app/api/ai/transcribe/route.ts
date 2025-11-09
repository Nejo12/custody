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

    // Check if file exists
    if (!file) {
      return new Response(JSON.stringify({ error: "Missing audio file" }), { status: 400 });
    }

    // Debug: log file type in test environment
    if (process.env.NODE_ENV === "test") {
      console.warn("File type:", typeof file);
      console.warn("File instanceof File:", file instanceof File);
      console.warn("File instanceof Blob:", file instanceof Blob);
      console.warn(
        "File constructor:",
        (file as { constructor?: { name?: string } }).constructor?.name
      );
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
        status: 200,
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }

    // Build multipart body to call OpenAI transcriptions
    const fd = new FormData();
    // Handle both File and Blob types, and ensure we have a name
    let fileName = "audio.webm";
    // Try to get filename from File, fallback to default
    if (file instanceof File) {
      fileName = file.name || fileName;
    } else if (file && typeof file === "object" && "name" in file) {
      const fileWithName = file as { name?: string };
      if (typeof fileWithName.name === "string") {
        fileName = fileWithName.name;
      }
    }

    // FormData.append accepts File | Blob | string
    // In test environments, files from FormData.get() might not be directly appendable to a new FormData
    // We need to read the file data and create a new Blob to ensure compatibility
    let fileToAppend: File | Blob;

    // Always read the file data and create a new Blob for maximum compatibility
    // This ensures the Blob works with the current FormData implementation
    // In test environments, files from FormData.get() may not be directly appendable
    try {
      // Try to read the file as an ArrayBuffer and create a new Blob
      // This works for both File and Blob objects, regardless of instanceof checks
      let arrayBuffer: ArrayBuffer;

      // Check if file has arrayBuffer method (File/Blob interface)
      // FormData.get() returns File | string | null, so we need to handle all cases
      // Try to access arrayBuffer method directly - this works even if instanceof checks fail
      if (typeof file === "string") {
        // If file is a string, it's not a valid file object
        return new Response(
          JSON.stringify({ error: "Invalid audio file: expected File or Blob, got string" }),
          {
            status: 400,
            headers: rateLimitResponse(rl.remaining, rl.resetAt),
          }
        );
      }

      // At this point, file should be File | Blob | null, but we already checked for null
      // Try to access arrayBuffer method - this works even if instanceof checks fail in test environments
      // Cast to any to bypass TypeScript's strict checking, then check if arrayBuffer exists
      const fileAny = file as unknown as { arrayBuffer?: () => Promise<ArrayBuffer> };
      if (fileAny && typeof fileAny.arrayBuffer === "function") {
        // File has arrayBuffer method, use it
        arrayBuffer = await fileAny.arrayBuffer();
      } else {
        // Check if file is a File or Blob by casting to unknown first
        const fileObj = file as unknown;
        if (fileObj instanceof File || fileObj instanceof Blob) {
          // instanceof check passes, try to use arrayBuffer directly
          // In jsdom, File objects might not have arrayBuffer, so we need to read via stream or text
          const fileAsBlob = fileObj as File | Blob;
          if (typeof fileAsBlob.arrayBuffer === "function") {
            arrayBuffer = await fileAsBlob.arrayBuffer();
          } else if (typeof fileAsBlob.stream === "function") {
            // Fallback: read via stream
            const stream = fileAsBlob.stream();
            const reader = stream.getReader();
            const chunks: Uint8Array[] = [];
            let done = false;
            while (!done) {
              const result = await reader.read();
              done = result.done ?? false;
              if (result.value) {
                chunks.push(result.value);
              }
            }
            const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const combined = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
              combined.set(chunk, offset);
              offset += chunk.length;
            }
            arrayBuffer = combined.buffer;
          } else {
            // Last resort: try to read as text and convert
            const text = await fileAsBlob.text();
            const encoder = new TextEncoder();
            arrayBuffer = encoder.encode(text).buffer;
          }
        } else {
          // File is not a File/Blob and doesn't have arrayBuffer
          // This shouldn't happen in normal operation, but handle gracefully
          return new Response(
            JSON.stringify({ error: "Invalid audio file: file is not a File or Blob" }),
            {
              status: 400,
              headers: rateLimitResponse(rl.remaining, rl.resetAt),
            }
          );
        }
      }

      // Create a new Blob from the arrayBuffer
      fileToAppend = new Blob([arrayBuffer], { type: "audio/webm" });
      fd.append("file", fileToAppend, fileName);
    } catch (formDataError) {
      const errorMsg =
        formDataError instanceof Error ? formDataError.message : "Invalid audio file";
      return new Response(JSON.stringify({ error: `Invalid audio file: ${errorMsg}` }), {
        status: 400,
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    fd.append("model", transcribeModel);
    // Optional: guidance
    fd.append("prompt", "Transcribe clearly. Return plain text.");

    let r: Response;
    try {
      r = await fetch(`${base}/audio/transcriptions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: fd,
      });
    } catch (fetchError) {
      const msg = fetchError instanceof Error ? fetchError.message : "Transcription API error";
      return new Response(JSON.stringify({ error: `Transcribe failed: ${msg}` }), {
        status: 502,
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    if (!r.ok) {
      let msg = "Transcription API error";
      try {
        msg = await r.text();
      } catch {
        msg = "Transcription API error";
      }
      return new Response(JSON.stringify({ error: `Transcribe failed: ${msg}` }), {
        status: 502,
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    let j: { text?: string; language?: string };
    try {
      j = (await r.json()) as { text?: string; language?: string };
    } catch (jsonError) {
      const errorMsg =
        jsonError instanceof Error ? jsonError.message : "Invalid transcription response";
      return new Response(JSON.stringify({ error: `Transcribe failed: ${errorMsg}` }), {
        status: 502,
        headers: rateLimitResponse(rl.remaining, rl.resetAt),
      });
    }
    const transcribed = (j.text || "").trim();
    const language = j.language || undefined;

    const result: TranscribeResult = { text: transcribed, language, translations: {} };

    async function translate(to: "en" | "de"): Promise<string> {
      const prompt = [
        `Translate the following text to ${to.toUpperCase()}. Return only the translated text.`,
        anonymizeText(transcribed),
      ].join("\n\n");
      let rr: Response;
      try {
        rr = await fetch(`${base}/chat/completions`, {
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
      } catch {
        // Return original text if translation fails
        return transcribed;
      }
      if (!rr.ok) return transcribed;
      let data: { choices?: Array<{ message?: { content?: string } }> };
      try {
        data = (await rr.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
      } catch {
        // If JSON parsing fails, return original text
        return transcribed;
      }
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
      status: 200,
      headers: rateLimitResponse(rl.remaining, rl.resetAt),
    });
  } catch (e) {
    // Return 400 for client errors (FormData parsing, etc.)
    // API errors should have been caught earlier and returned 502
    const msg = e instanceof Error ? e.message : "Unexpected error";
    const errorType = e instanceof Error ? e.constructor.name : typeof e;

    // Only return 400 for actual FormData parsing errors
    // Check if this is a TypeError related to formData() method call
    if (e instanceof TypeError && (msg.includes("formData") || msg.includes("Cannot read"))) {
      return new Response(JSON.stringify({ error: msg }), { status: 400 });
    }
    // For other unexpected errors, log and return 500
    // This ensures API errors (which should have been caught earlier) don't get misclassified
    console.error("Transcribe route error:", { errorType, message: msg, error: e });
    // In test environment, return the actual error message for debugging
    const isTest = process.env.NODE_ENV === "test";
    return new Response(
      JSON.stringify({
        error: isTest ? `Internal server error: ${msg} (${errorType})` : "Internal server error",
      }),
      { status: 500 }
    );
  }
}
