import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handler } from "../send-reminders";
import { HandlerEvent, HandlerContext } from "@netlify/functions";

/**
 * Mock HandlerEvent for testing
 */
const createMockEvent = (): HandlerEvent => ({
  rawUrl: "https://example.com/.netlify/functions/send-reminders",
  rawQuery: "",
  path: "/.netlify/functions/send-reminders",
  httpMethod: "POST",
  headers: {},
  multiValueHeaders: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  body: null,
  isBase64Encoded: false,
});

/**
 * Mock HandlerContext for testing
 */
const createMockContext = (): HandlerContext => ({
  callbackWaitsForEmptyEventLoop: true,
  functionName: "send-reminders",
  functionVersion: "1",
  invokedFunctionArn: "arn:aws:lambda:us-east-1:123456789012:function:send-reminders",
  memoryLimitInMB: "1024",
  awsRequestId: "test-request-id",
  logGroupName: "/aws/lambda/send-reminders",
  logStreamName: "2025/11/11/[$LATEST]test",
  getRemainingTimeInMillis: () => 30000,
  done: vi.fn(),
  fail: vi.fn(),
  succeed: vi.fn(),
  clientContext: undefined,
});

/**
 * Tests for the send-reminders Netlify scheduled function
 */
describe("send-reminders Netlify Function", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    vi.resetModules();
    process.env = { ...originalEnv };

    // Set default environment variables
    process.env.NEXT_PUBLIC_APP_URL = "https://custodyclarity.com";
    process.env.REMINDERS_CRON_SECRET = "test-secret-key-12345";

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should return error if REMINDERS_CRON_SECRET is not configured", async () => {
    // Remove the secret from environment
    delete process.env.REMINDERS_CRON_SECRET;

    const event = createMockEvent();
    const context = createMockContext();

    const response = await handler(event, context);

    expect(response.statusCode).toBe(500);
    expect(response.body).toBeDefined();

    if (response.body) {
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe("Cron secret not configured");
    }
  });

  it("should call the API endpoint with correct authentication", async () => {
    // Mock successful fetch responses for both endpoints
    const mockCourtResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "Processed 3 reminders",
        sent: 2,
        failed: 1,
      }),
    };

    const mockPlanningResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "No reminders to send",
        count: 0,
        sent: 0,
        failed: 0,
      }),
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockCourtResponse)
      .mockResolvedValueOnce(mockPlanningResponse);

    const event = createMockEvent();
    const context = createMockContext();

    const response = await handler(event, context);

    // Verify fetch was called for both endpoints
    expect(global.fetch).toHaveBeenCalledWith("https://custodyclarity.com/api/reminders/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-secret-key-12345",
      },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://custodyclarity.com/api/planning/reminders/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-secret-key-12345",
        },
      }
    );

    // Verify response
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();

    if (response.body) {
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.total.sent).toBe(2);
      expect(body.total.failed).toBe(1);
      expect(body.timestamp).toBeDefined();
    }
  });

  it("should handle API endpoint returning no reminders", async () => {
    // Mock responses with no reminders for both endpoints
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "No reminders to send",
        count: 0,
        sent: 0,
        failed: 0,
      }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const event = createMockEvent();
    const context = createMockContext();

    const response = await handler(event, context);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();

    if (response.body) {
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.total.sent).toBe(0);
      expect(body.total.failed).toBe(0);
    }
  });

  it("should handle API endpoint errors", async () => {
    // Mock failed API response for court reminders
    const mockCourtResponse = {
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: "Unauthorized",
      }),
    };

    // Mock successful planning reminders response
    const mockPlanningResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "No reminders to send",
        sent: 0,
        failed: 0,
      }),
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockCourtResponse)
      .mockResolvedValueOnce(mockPlanningResponse);

    const event = createMockEvent();
    const context = createMockContext();

    const response = await handler(event, context);

    // Should return 207 (Multi-Status) when one endpoint fails
    expect(response.statusCode).toBe(207);
    expect(response.body).toBeDefined();

    if (response.body) {
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.errors).toBeDefined();
      expect(Array.isArray(body.errors)).toBe(true);
    }
  });

  it("should handle network errors", async () => {
    // Mock fetch throwing an error for court reminders
    // Planning reminders should still be called
    const mockPlanningResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "No reminders to send",
        sent: 0,
        failed: 0,
      }),
    };

    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockPlanningResponse);

    const event = createMockEvent();
    const context = createMockContext();

    const response = await handler(event, context);

    // Should return 207 (Multi-Status) when one endpoint has network error
    expect(response.statusCode).toBe(207);
    expect(response.body).toBeDefined();

    if (response.body) {
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.errors).toBeDefined();
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.timestamp).toBeDefined();
    }
  });

  it("should use custom APP_URL from environment if provided", async () => {
    // Set custom app URL
    process.env.NEXT_PUBLIC_APP_URL = "https://custom-domain.com";

    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "Processed 0 reminders",
        sent: 0,
        failed: 0,
      }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const event = createMockEvent();
    const context = createMockContext();

    await handler(event, context);

    // Verify fetch was called with custom domain for both endpoints
    expect(global.fetch).toHaveBeenCalledWith(
      "https://custom-domain.com/api/reminders/send",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "https://custom-domain.com/api/planning/reminders/send",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("should handle missing APP_URL gracefully", async () => {
    // Remove app URL from environment
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.URL;

    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "Processed 0 reminders",
        sent: 0,
        failed: 0,
      }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const event = createMockEvent();
    const context = createMockContext();

    await handler(event, context);

    // Should use default custodyclarity.com domain for both endpoints
    expect(global.fetch).toHaveBeenCalledWith(
      "https://custodyclarity.com/api/reminders/send",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "https://custodyclarity.com/api/planning/reminders/send",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("should include timestamp in success response", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "Processed 1 reminder",
        sent: 1,
        failed: 0,
      }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const event = createMockEvent();
    const context = createMockContext();

    const response = await handler(event, context);

    expect(response.body).toBeDefined();

    if (response.body) {
      const body = JSON.parse(response.body);
      expect(body.timestamp).toBeDefined();
      // Verify timestamp is a valid ISO date string
      expect(() => new Date(body.timestamp)).not.toThrow();
      expect(body.total).toBeDefined();
    }
  });
});
