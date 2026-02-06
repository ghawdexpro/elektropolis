const requests = new Map<string, number[]>();

// Clean up old entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requests.entries()) {
    const fresh = timestamps.filter((t) => now - t < 120_000);
    if (fresh.length === 0) requests.delete(key);
    else requests.set(key, fresh);
  }
}, 60_000);

/**
 * Simple in-memory rate limiter.
 * Returns true if the request should be ALLOWED, false if rate-limited.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const timestamps = requests.get(key) ?? [];
  const windowStart = now - windowMs;
  const recent = timestamps.filter((t) => t >= windowStart);

  if (recent.length >= limit) {
    return false;
  }

  recent.push(now);
  requests.set(key, recent);
  return true;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
