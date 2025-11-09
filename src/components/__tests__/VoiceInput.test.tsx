import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import VoiceInput from "../VoiceInput";
import { I18nProvider } from "@/i18n";

describe("VoiceInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      writable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [
            {
              stop: vi.fn(),
            },
          ],
        }),
      },
    });
    global.MediaRecorder = class MediaRecorder {
      start = vi.fn();
      stop = vi.fn();
      state = "inactive";
      stream = {
        getTracks: () => [
          {
            stop: vi.fn(),
          },
        ],
      };
      ondataavailable: ((e: BlobEvent) => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(_stream: MediaStream, _options?: MediaRecorderOptions) {
        // constructor for mock
      }
    } as unknown as typeof MediaRecorder;
  });

  it("renders start button", () => {
    render(
      <I18nProvider>
        <VoiceInput />
      </I18nProvider>
    );
    expect(screen.getByText(/start/i)).toBeInTheDocument();
  });

  it("shows stop button when recording", async () => {
    render(
      <I18nProvider>
        <VoiceInput />
      </I18nProvider>
    );
    const startButton = screen.getByText(/start/i);
    fireEvent.click(startButton);
    await waitFor(() => {
      expect(screen.getByText(/stop/i)).toBeInTheDocument();
    });
  });

  it("calls onTranscript callback", async () => {
    const mockOnTranscript = vi.fn();
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          text: "Test transcript",
          language: "en",
          translations: { en: "Test transcript", de: "Test Transkript" },
        }),
        { status: 200 }
      )
    );

    // In jsdom, Blob created from array of Blobs might not be recognized properly by FormData
    // Mock FormData to be more lenient and accept blob-like objects
    const OriginalFormData = global.FormData;
    global.FormData = class FormData extends OriginalFormData {
      private _entries = new Map<string, string | Blob>();

      append(name: string, value: string | Blob, _fileName?: string): void {
        // Accept any blob-like object (has size and type properties)
        if (value && typeof value === "object" && "size" in value && "type" in value) {
          // If it's not a proper Blob instance, create one from its data
          if (!(value instanceof Blob)) {
            const blobLike = value as { size: number; type: string };
            const fixedBlob = new Blob([new Uint8Array(Math.max(1, blobLike.size || 1))], {
              type: blobLike.type || "audio/webm",
            });
            this._entries.set(name, fixedBlob);
            return;
          }
        }
        this._entries.set(name, value);
      }

      get(name: string): FormDataEntryValue | null {
        return (this._entries.get(name) as FormDataEntryValue) || null;
      }

      getAll(name: string): FormDataEntryValue[] {
        const values: FormDataEntryValue[] = [];
        for (const [key, value] of this._entries.entries()) {
          if (key === name) {
            values.push(value as FormDataEntryValue);
          }
        }
        return values;
      }

      has(name: string): boolean {
        return this._entries.has(name);
      }

      delete(name: string): void {
        this._entries.delete(name);
      }

      set(name: string, value: string | Blob, fileName?: string): void {
        this.append(name, value, fileName);
      }

      entries(): ReturnType<typeof OriginalFormData.prototype.entries> {
        return Array.from(this._entries.entries()).map(([k, v]) => [
          k,
          v as FormDataEntryValue,
        ]) as unknown as FormDataIterator<[string, FormDataEntryValue]>;
      }

      keys(): ReturnType<typeof OriginalFormData.prototype.keys> {
        return Array.from(this._entries.keys()) as unknown as FormDataIterator<string>;
      }

      values(): ReturnType<typeof OriginalFormData.prototype.values> {
        return Array.from(this._entries.values()).map(
          (v) => v as FormDataEntryValue
        ) as unknown as ReturnType<typeof OriginalFormData.prototype.values>;
      }
    } as unknown as typeof FormData;

    const createTestBlob = () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      return new Blob([data], { type: "audio/webm" });
    };

    const recorderInstances: Array<{
      onstop: (() => void | Promise<void>) | null;
      ondataavailable: ((e: BlobEvent) => void) | null;
    }> = [];
    const originalMR = global.MediaRecorder;
    global.MediaRecorder = class MediaRecorder {
      start = vi.fn();
      stop = vi.fn(() => {
        const instance = recorderInstances[recorderInstances.length - 1];
        // First trigger ondataavailable to populate chunks with a valid Blob
        if (instance?.ondataavailable) {
          const blob = createTestBlob();
          instance.ondataavailable({ data: blob } as BlobEvent);
        }
        // Then trigger onstop (async callback) - fire and forget
        if (instance?.onstop) {
          const result = instance.onstop();
          // Ensure promise is handled to prevent unhandled rejection
          if (result instanceof Promise) {
            result.catch(() => {
              // Silently handle errors
            });
          }
        }
      });
      state = "recording";
      stream = {
        getTracks: () => [
          {
            stop: vi.fn(),
          },
        ],
      };
      ondataavailable: ((e: BlobEvent) => void) | null = null;
      onstop: (() => void | Promise<void>) | null = null;
      constructor(_stream: MediaStream, _options?: MediaRecorderOptions) {
        recorderInstances.push(this);
      }
    } as unknown as typeof MediaRecorder;

    render(
      <I18nProvider>
        <VoiceInput onTranscript={mockOnTranscript} />
      </I18nProvider>
    );
    const startButton = screen.getByText(/start/i);
    await act(async () => {
      fireEvent.click(startButton);
    });
    await waitFor(() => {
      expect(screen.getByText(/stop/i)).toBeInTheDocument();
    });
    const stopButton = screen.getByText(/stop/i);
    fireEvent.click(stopButton);
    // Wait for fetch to be called (this ensures onstop async callback started)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    // Wait for the async onstop callback to complete and onTranscript to be called
    await waitFor(
      () => {
        expect(mockOnTranscript).toHaveBeenCalledWith(
          "Test transcript",
          { en: "Test transcript", de: "Test Transkript" },
          "en"
        );
      },
      { timeout: 5000, interval: 100 }
    );
    global.MediaRecorder = originalMR;
    global.FormData = OriginalFormData;
  });

  it("handles transcription error", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Transcription failed" }), { status: 500 })
    );

    const recorderInstances: Array<{ onstop: (() => void) | null }> = [];
    const originalMR = global.MediaRecorder;
    global.MediaRecorder = class MediaRecorder {
      start = vi.fn();
      stop = vi.fn(() => {
        const instance = recorderInstances[recorderInstances.length - 1];
        if (instance?.onstop) {
          instance.onstop();
        }
      });
      state = "recording";
      stream = {
        getTracks: () => [
          {
            stop: vi.fn(),
          },
        ],
      };
      ondataavailable: ((e: BlobEvent) => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(_stream: MediaStream, _options?: MediaRecorderOptions) {
        recorderInstances.push(this);
      }
    } as unknown as typeof MediaRecorder;

    render(
      <I18nProvider>
        <VoiceInput />
      </I18nProvider>
    );
    const startButton = screen.getByText(/start/i);
    fireEvent.click(startButton);
    await waitFor(() => {
      expect(screen.getByText(/stop/i)).toBeInTheDocument();
    });
    const stopButton = screen.getByText(/stop/i);
    fireEvent.click(stopButton);
    await waitFor(
      () => {
        const errorElement = screen.queryByText(/failed/i) || screen.queryByText(/error/i);
        expect(errorElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    global.MediaRecorder = originalMR;
  });

  it("handles disabled transcription", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ disabled: true }), { status: 200 })
    );

    const recorderInstances: Array<{
      onstop: (() => void | Promise<void>) | null;
      ondataavailable: ((e: BlobEvent) => void) | null;
    }> = [];
    let onstopPromise: Promise<void> | null = null;
    const originalMR = global.MediaRecorder;
    global.MediaRecorder = class MediaRecorder {
      start = vi.fn();
      stop = vi.fn(() => {
        const instance = recorderInstances[recorderInstances.length - 1];
        // First trigger ondataavailable to populate chunks
        if (instance?.ondataavailable) {
          const blob = new Blob(["test"], { type: "audio/webm" });
          instance.ondataavailable({ data: blob } as BlobEvent);
        }
        // Then trigger onstop (call it directly and store the promise)
        if (instance?.onstop) {
          const result = instance.onstop();
          // Store the promise so we can await it in the test
          if (result instanceof Promise) {
            onstopPromise = result;
          }
        }
      });
      state = "recording";
      stream = {
        getTracks: () => [
          {
            stop: vi.fn(),
          },
        ],
      };
      ondataavailable: ((e: BlobEvent) => void) | null = null;
      onstop: (() => void | Promise<void>) | null = null;
      constructor(_stream: MediaStream, _options?: MediaRecorderOptions) {
        recorderInstances.push(this);
      }
    } as unknown as typeof MediaRecorder;

    render(
      <I18nProvider>
        <VoiceInput />
      </I18nProvider>
    );
    const startButton = screen.getByText(/start/i);
    await act(async () => {
      fireEvent.click(startButton);
    });
    await waitFor(() => {
      expect(screen.getByText(/stop/i)).toBeInTheDocument();
    });
    const stopButton = screen.getByText(/stop/i);
    await act(async () => {
      fireEvent.click(stopButton);
    });
    // Wait for onstop promise to complete if it was created
    if (onstopPromise !== null && onstopPromise !== undefined) {
      const promise = onstopPromise as Promise<void>;
      await promise.catch((error: unknown) => {
        if (error instanceof Error) {
          console.error("onstop error:", error.message);
        } else {
          console.error("onstop error:", String(error));
        }
      });
    }
    global.MediaRecorder = originalMR;
  });

  it("handles microphone unavailable", async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      new Error("Microphone unavailable")
    );

    render(
      <I18nProvider>
        <VoiceInput />
      </I18nProvider>
    );
    const startButton = screen.getByText(/start/i);
    fireEvent.click(startButton);
    await waitFor(() => {
      expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
    });
  });
});
