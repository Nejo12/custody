import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/ai/clarify/route";

describe("ai clarify route (stub mode)", () => {
  it("returns a structured suggestion when no API key", async () => {
    const req = new Request("http://localhost/api/ai/clarify", {
      method: "POST",
      body: JSON.stringify({
        questionId: "married_at_birth",
        answers: { married_at_birth: "unsure" },
        locale: "de",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    const data = await res.json();
    expect(typeof data.suggestion).toBe("string");
    expect(typeof data.confidence).toBe("number");
  });
});
