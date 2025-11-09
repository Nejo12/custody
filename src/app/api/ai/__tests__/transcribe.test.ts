import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST } from "../transcribe/route";
import type { NextRequest } from "next/server";
import { clearRateLimitBuckets } from "@/lib/ratelimit";

type MockNextRequest = Pick<NextRequest, "formData"> & {
  headers: Headers;
};

// Create a test-friendly Blob that has all necessary methods
class TestBlob extends Blob {
  private data: Uint8Array;

  constructor(parts: BlobPart[], options?: BlobPropertyBag) {
    super(parts, options);
    // Store the data for later access
    const encoder = new TextEncoder();
    this.data = encoder.encode(parts.join(""));
  }

  override arrayBuffer(): Promise<ArrayBuffer> {
    // Create a fresh ArrayBuffer from the data to ensure it's a proper ArrayBuffer
    const buffer = new ArrayBuffer(this.data.byteLength);
    const view = new Uint8Array(buffer);
    view.set(this.data);
    return Promise.resolve(buffer);
  }

  override stream(): ReadableStream {
    const data = this.data;
    return new ReadableStream({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    }) as ReadableStream;
  }

  override text(): Promise<string> {
    const decoder = new TextDecoder();
    return Promise.resolve(decoder.decode(this.data));
  }
}

// Create a test-friendly File
class TestFile extends TestBlob {
  public name: string;
  public lastModified: number;

  constructor(parts: BlobPart[], name: string, options?: FilePropertyBag) {
    super(parts, options);
    this.name = name;
    this.lastModified = options?.lastModified ?? Date.now();
  }
}

// Create a FormData wrapper that preserves File objects
// jsdom's FormData.get() converts File objects to strings, so we need to fix this
class PreservingFormData extends FormData {
  private entriesMap = new Map<string, File | Blob | string>();

  constructor() {
    // Don't call super with any arguments to avoid HTMLFormElement type issues in jsdom
    super();
  }

  // Override get to return the preserved File/Blob instead of string
  get(name: string): FormDataEntryValue | null {
    // Return the preserved value from our map
    return this.entriesMap.get(name) as FormDataEntryValue | null;
  }

  getAll(name: string): FormDataEntryValue[] {
    const values: FormDataEntryValue[] = [];
    for (const [key, value] of this.entriesMap.entries()) {
      if (key === name) {
        values.push(value as FormDataEntryValue);
      }
    }
    return values;
  }

  append(name: string, value: string | Blob, _fileName?: string): void {
    // Store the original value
    const valueToStore: FormDataEntryValue = value as FormDataEntryValue;

    this.entriesMap.set(name, valueToStore);

    // Only call super.append for strings
    // For File/Blob objects in tests, we just store them in our map
    // Don't call super.append for Blob/File as they may not be compatible with jsdom's FormData
    if (typeof value === "string") {
      super.append(name, value);
    }
    // For Blob/File, we've already stored it in entriesMap, so we're done
  }

  // Override entries to return preserved values
  *entries(): FormDataIterator<[string, FormDataEntryValue]> {
    for (const [key, value] of this.entriesMap.entries()) {
      yield [key, value as FormDataEntryValue];
    }
  }
}

// Helper that accepts File objects directly to preserve them
function createMockRequestWithFiles(
  files: Record<string, File | Blob>,
  otherFields?: Record<string, string>
): MockNextRequest {
  const headers = new Headers();
  const preservingFormData = new PreservingFormData();

  // Add files first (these will be preserved)
  for (const [key, file] of Object.entries(files)) {
    preservingFormData.append(key, file);
  }

  // Add other string fields
  if (otherFields) {
    for (const [key, value] of Object.entries(otherFields)) {
      preservingFormData.append(key, value);
    }
  }

  return {
    formData: async () => preservingFormData,
    headers,
  };
}

describe("ai transcribe route", () => {
  let OriginalFormData: typeof FormData;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_API_KEY;
    delete process.env.OPENAI_API_BASE;
    delete process.env.AI_API_BASE;
    delete process.env.OPENAI_MODEL;
    delete process.env.AI_MODEL;
    delete process.env.OPENAI_TRANSCRIBE_MODEL;
    delete process.env.AI_TRANSCRIBE_MODEL;
    global.fetch = vi.fn();
    // Clear rate limit buckets between tests
    clearRateLimitBuckets();
    // Use fake timers to control rate limiting
    vi.useFakeTimers();

    // Store original FormData
    OriginalFormData = global.FormData;

    // Mock FormData to work with Blob in jsdom
    global.FormData = class MockedFormData extends OriginalFormData {
      append(name: string, value: string | Blob, _fileName?: string): void {
        // Accept any Blob-like object by skipping validation
        // In jsdom, Blob objects created by the route don't work with FormData.append
        // So we just bypass the actual append for Blob objects
        if (typeof value === "string") {
          super.append(name, value as unknown as Blob);
        }
        // For Blob objects, we don't actually append them to avoid the jsdom error
        // The mock fetch won't care about the FormData contents anyway
      }
    } as unknown as typeof FormData;
  });

  afterEach(() => {
    vi.useRealTimers();
    // Restore original FormData
    global.FormData = OriginalFormData;
  });

  it("returns disabled response when no API key", async () => {
    const file = new TestFile(["test audio"], "test.webm", { type: "audio/webm" });

    const mockReq = {
      ...createMockRequestWithFiles({ audio: file }, { target: "both" }),
      headers: new Headers({ "x-forwarded-for": "192.168.1.100" }),
    };
    const res = await POST(mockReq as NextRequest);
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("disabled", true);
    expect(json).toHaveProperty("text", "");
    expect(json).toHaveProperty("translations", {});
  });

  it("handles missing audio file", async () => {
    const mockReq = {
      ...createMockRequestWithFiles({}, {}),
      headers: new Headers({ "x-forwarded-for": "192.168.1.101" }),
    };
    const res = await POST(mockReq as NextRequest);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error", "Missing audio file");
  });

  it("handles rate limiting", async () => {
    const file = new TestFile(["test"], "test.webm", { type: "audio/webm" });

    // Make 15 requests (the limit is 15 per 60s)
    for (let i = 0; i < 15; i++) {
      const mockReq = {
        ...createMockRequestWithFiles({ audio: file }),
        headers: new Headers({ "x-forwarded-for": "192.168.1.102" }),
      };
      await POST(mockReq as NextRequest);
    }

    // The 16th request should be rate limited
    const mockReq = {
      ...createMockRequestWithFiles({ audio: file }),
      headers: new Headers({ "x-forwarded-for": "192.168.1.102" }),
    };
    const res = await POST(mockReq as NextRequest);
    expect(res.status).toBe(429);
  });

  it("transcribes audio successfully with API key", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockTranscribeResponse = {
      text: "Hello world",
      language: "en",
    };
    const mockTranslateResponse = {
      choices: [
        {
          message: {
            content: "Hallo Welt",
          },
        },
      ],
    };

    // Mock fetch to avoid FormData/Blob issues in test environment
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("transcriptions")) {
        return Promise.resolve(
          new Response(JSON.stringify(mockTranscribeResponse), { status: 200 })
        );
      } else {
        return Promise.resolve(
          new Response(JSON.stringify(mockTranslateResponse), { status: 200 })
        );
      }
    });

    global.fetch = mockFetch as unknown as typeof fetch;

    const file = new TestFile(["test audio"], "test.webm", { type: "audio/webm" });

    const mockReq = {
      ...createMockRequestWithFiles({ audio: file }, { target: "both" }),
      headers: new Headers({ "x-forwarded-for": "192.168.1.103" }),
    };
    const res = await POST(mockReq as NextRequest);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("text", "Hello world");
    expect(json).toHaveProperty("language", "en");
    expect(json).toHaveProperty("translations");
    expect(json.translations?.en).toBeDefined();
    expect(json.translations?.de).toBeDefined();
  });

  it("handles transcription API failure", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const mockFetch = vi.fn().mockResolvedValueOnce(new Response("API Error", { status: 500 }));

    global.fetch = mockFetch as unknown as typeof fetch;

    const file = new TestFile(["test audio"], "test.webm", { type: "audio/webm" });

    const mockReq = {
      ...createMockRequestWithFiles({ audio: file }),
      headers: new Headers({ "x-forwarded-for": "192.168.1.104" }),
    };
    const res = await POST(mockReq as NextRequest);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("handles translation failure gracefully", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockTranscribeResponse = {
      text: "Hello world",
      language: "en",
    };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTranscribeResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response("Translation Error", { status: 500 }));

    global.fetch = mockFetch as unknown as typeof fetch;

    const file = new TestFile(["test audio"], "test.webm", { type: "audio/webm" });

    const mockReq = {
      ...createMockRequestWithFiles({ audio: file }, { target: "en" }),
      headers: new Headers({ "x-forwarded-for": "192.168.1.105" }),
    };
    const res = await POST(mockReq as NextRequest);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("text", "Hello world");
    expect(json.translations?.en).toBe("Hello world");
  });

  it("handles target=en only", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockTranscribeResponse = {
      text: "Hello world",
      language: "en",
    };
    const mockTranslateResponse = {
      choices: [
        {
          message: {
            content: "Hello world",
          },
        },
      ],
    };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTranscribeResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTranslateResponse), { status: 200 }));

    global.fetch = mockFetch as unknown as typeof fetch;

    const file = new TestFile(["test audio"], "test.webm", { type: "audio/webm" });

    const mockReq = {
      ...createMockRequestWithFiles({ audio: file }, { target: "en" }),
      headers: new Headers({ "x-forwarded-for": "192.168.1.106" }),
    };
    const res = await POST(mockReq as NextRequest);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("translations");
    expect(json.translations?.en).toBeDefined();
    expect(json.translations?.de).toBeUndefined();
  });

  it("handles target=de only", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockTranscribeResponse = {
      text: "Hello world",
      language: "en",
    };
    const mockTranslateResponse = {
      choices: [
        {
          message: {
            content: "Hallo Welt",
          },
        },
      ],
    };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTranscribeResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTranslateResponse), { status: 200 }));

    global.fetch = mockFetch as unknown as typeof fetch;

    const file = new TestFile(["test audio"], "test.webm", { type: "audio/webm" });

    const mockReq = {
      ...createMockRequestWithFiles({ audio: file }, { target: "de" }),
      headers: new Headers({ "x-forwarded-for": "192.168.1.107" }),
    };
    const res = await POST(mockReq as NextRequest);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("translations");
    expect(json.translations?.de).toBeDefined();
    expect(json.translations?.en).toBeUndefined();
  });

  it("handles exception", async () => {
    const mockReq = {
      formData: async () => {
        throw new TypeError("formData parsing error");
      },
      headers: new Headers({ "x-forwarded-for": "192.168.1.108" }),
    } as unknown as NextRequest;

    const res = await POST(mockReq);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("handles missing language in transcription response", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const mockTranscribeResponse = {
      text: "Hello world",
    };
    const mockTranslateResponse = {
      choices: [
        {
          message: {
            content: "Hallo Welt",
          },
        },
      ],
    };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTranscribeResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTranslateResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTranslateResponse), { status: 200 }));

    global.fetch = mockFetch as unknown as typeof fetch;

    const file = new TestFile(["test audio"], "test.webm", { type: "audio/webm" });

    const mockReq = {
      ...createMockRequestWithFiles({ audio: file }, { target: "both" }),
      headers: new Headers({ "x-forwarded-for": "192.168.1.109" }),
    };
    const res = await POST(mockReq as NextRequest);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty("text", "Hello world");
  });
});
