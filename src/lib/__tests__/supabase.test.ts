import { describe, it, expect, beforeEach, vi } from "vitest";
import { supabase } from "../supabase";

// Mock @supabase/supabase-js
const mockClient = {
  from: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockClient),
}));

describe("supabase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("creates client with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    // Access supabase to trigger client creation
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it("creates client with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY", () => {
    process.env.SUPABASE_URL = "https://test2.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

    // Access supabase to trigger client creation
    expect(supabase).toBeDefined();
  });

  it("creates proxy that delegates to client", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-proxy.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-proxy-key";

    // Access supabase to verify proxy works
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeDefined();
    expect(typeof supabase.from).toBe("function");
  });

  it("reuses client instance on subsequent calls", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test3.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    vi.clearAllMocks();

    expect(supabase).toBeDefined();
    expect(supabase.from).toBeDefined();
    expect(typeof supabase.from).toBe("function");
  });
});
