import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client if credentials are available
const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

// Fallback in-memory store for development/testing when Redis is not configured
const buckets = new Map<string, { count: number; resetAt: number }>();

export function getClientKey(req: Request, scope = "global"): string {
  try {
    const headers = req.headers;
    const xf = headers.get("x-forwarded-for") || headers.get("x-real-ip") || "";
    const ip = xf.split(",")[0]?.trim() || "anon";
    return `${scope}:${ip}`;
  } catch {
    return `${scope}:anon`;
  }
}

export async function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const resetAt = now + windowMs;
  const ttlSeconds = Math.ceil(windowMs / 1000);

  // Use Redis if available, otherwise fallback to in-memory
  if (redis) {
    try {
      // Use INCR for atomic increment, then check if we need to set TTL
      const count = await redis.incr(key);
      
      // Set TTL only on first increment (when count is 1)
      if (count === 1) {
        await redis.expire(key, ttlSeconds);
      }

      if (count > limit) {
        // Get TTL to return accurate resetAt
        const ttl = await redis.ttl(key);
        const actualResetAt = ttl > 0 ? now + ttl * 1000 : resetAt;
        return { allowed: false, remaining: 0, resetAt: actualResetAt };
      }

      return { allowed: true, remaining: Math.max(0, limit - count), resetAt };
    } catch (error) {
      console.error("Redis rate limit error:", error);
      // Fallback to in-memory on Redis errors
    }
  }

  // Fallback to in-memory implementation
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    const bucket = { count: 1, resetAt };
    buckets.set(key, bucket);
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  if (b.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: b.resetAt };
  }
  b.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - b.count), resetAt: b.resetAt };
}

export function rateLimitResponse(remaining: number, resetAt: number) {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.floor(resetAt / 1000)),
  } as Record<string, string>;
}

// For testing: clear all buckets
export async function clearRateLimitBuckets() {
  buckets.clear();
  // Note: Redis keys will expire automatically based on TTL
  // For testing, if you need to clear Redis keys, you'd need to track them
  // or use a test-specific key prefix that can be deleted
}
