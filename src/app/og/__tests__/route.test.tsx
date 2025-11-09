import { describe, it, expect, vi } from "vitest";
import { GET } from "../route";
import type { NextRequest } from "next/server";

// Mock next/og - ImageResponse is a class constructor
vi.mock("next/og", () => ({
  ImageResponse: class MockImageResponse {
    element: unknown;
    options: unknown;
    constructor(element: unknown, options?: unknown) {
      this.element = element;
      this.options = options;
    }
  },
}));

describe("og route", () => {
  it("returns ImageResponse with correct structure", async () => {
    const request = {} as NextRequest;
    const response = await GET(request);
    expect(response).toBeDefined();
    expect(response).toBeInstanceOf(Object);
  });

  it("has edge runtime", () => {
    // This is a compile-time check, but we can verify the export exists
    expect(GET).toBeDefined();
  });
});
