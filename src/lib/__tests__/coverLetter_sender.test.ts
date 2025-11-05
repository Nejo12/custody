import { describe, it, expect } from "vitest";
import { buildCoverLetter } from "@/lib/coverLetter";

describe("coverLetter sender", () => {
  it("generates pdf bytes with sender", async () => {
    const bytes = await buildCoverLetter("joint", "en", "berlin-mitte", {
      fullName: "Test Sender",
      address: "10115 Berlin",
      phone: "+49 30 000",
      email: "x@y.z",
    });
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(1000);
  });
});
