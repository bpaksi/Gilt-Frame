import { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const attempts = new Map<string, RateLimitEntry>();

  return {
    check(ip: string): boolean {
      const now = Date.now();
      const entry = attempts.get(ip);
      if (!entry) return true;
      if (now > entry.resetAt) {
        attempts.delete(ip);
        return true;
      }
      return entry.count < maxAttempts;
    },

    record(ip: string): void {
      const now = Date.now();
      const entry = attempts.get(ip);
      if (!entry || now > entry.resetAt) {
        attempts.set(ip, { count: 1, resetAt: now + windowMs });
      } else {
        entry.count++;
      }
    },

    clear(ip: string): void {
      attempts.delete(ip);
    },
  };
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
