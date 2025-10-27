import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = 'Zbyt wiele żądań, spróbuj ponownie później' } = options;

  return (request: NextRequest) => {
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    // const windowStart = now - windowMs

    // Clean up expired entries
    for (const [key, value] of Array.from(rateLimitStore.entries())) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }

    // Get or create rate limit entry
    const key = `${ip}:${request.nextUrl.pathname}`;
    const entry = rateLimitStore.get(key);

    if (!entry) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return null; // No rate limit exceeded
    }

    if (entry.resetTime < now) {
      // Reset window
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return null;
    }

    if (entry.count >= max) {
      return NextResponse.json(
        { error: message },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
          },
        }
      );
    }

    // Increment counter
    entry.count++;
    return null;
  };
}

// Predefined rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Zbyt wiele prób logowania, spróbuj ponownie za 15 minut',
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Zbyt wiele żądań API, spróbuj ponownie później',
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Zbyt wiele przesyłanych plików, spróbuj ponownie za godzinę',
});

export const smsRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 SMS per hour
  message: 'Zbyt wiele próśb o SMS, spróbuj ponownie za godzinę',
});
