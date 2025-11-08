type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

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

export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    const bucket: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, bucket);
    return { allowed: true, remaining: limit - 1, resetAt: bucket.resetAt };
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
