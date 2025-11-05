"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  target?: "en" | "de" | "both";
  onTranscript?: (
    text: string,
    translations: { en?: string; de?: string },
    language?: string
  ) => void;
};

export default function VoiceInput({ target = "both", onTranscript }: Props) {
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");

  useEffect(() => {
    return () => {
      if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    };
  }, []);

  async function start() {
    setError("");
    setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        try {
          setBusy(true);
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const fd = new FormData();
          fd.append("audio", blob, "audio.webm");
          fd.append("target", target);
          const res = await fetch("/api/ai/transcribe", { method: "POST", body: fd });
          const data = (await res.json()) as {
            text?: string;
            language?: string;
            translations?: { en?: string; de?: string };
            disabled?: boolean;
            error?: string;
          };
          if (data.error) throw new Error(data.error);
          if (data.disabled) {
            setError("Transcription disabled.");
            return;
          }
          const txt = data.text || "";
          setTranscript(txt);
          onTranscript?.(txt, data.translations || {}, data.language);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to transcribe";
          setError(msg);
        } finally {
          setBusy(false);
        }
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Microphone unavailable";
      setError(msg);
    }
  }

  function stop() {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
      mediaRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setRecording(false);
  }

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="text-sm font-medium">Speak your answer</div>
      <div className="flex items-center gap-2">
        {!recording && (
          <button
            type="button"
            onClick={start}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
            aria-label="Start recording"
          >
            Start
          </button>
        )}
        {recording && (
          <button
            type="button"
            onClick={stop}
            className="rounded-lg border px-3 py-1 text-sm bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50"
            aria-label="Stop recording"
          >
            Stop
          </button>
        )}
        {busy && <div className="text-xs text-zinc-500">Transcribing…</div>}
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
      {transcript && <div className="text-xs text-zinc-600 dark:text-zinc-300">“{transcript}”</div>}
    </div>
  );
}
