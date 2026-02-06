import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate limiting configuration using Upstash Redis
 * Protects against abuse and spam
 */

// Initialize Redis client
// Only initialize if credentials are available
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else if (process.env.NODE_ENV === 'production') {
  console.error('UPSTASH_REDIS credentials not set in production!');
}

/**
 * Checkout rate limiter
 * 10 checkout sessions per hour per IP
 */
export const checkoutLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      prefix: 'ratelimit:checkout',
      analytics: true,
    })
  : null;

/**
 * Order view rate limiter
 * 3 order views per hour per IP (for public order pages)
 */
export const orderViewLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      prefix: 'ratelimit:order-view',
      analytics: true,
    })
  : null;

/**
 * Generic API rate limiter
 * 60 requests per minute per IP
 */
export const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      prefix: 'ratelimit:api',
      analytics: true,
    })
  : null;

/**
 * Helper to check rate limit and return appropriate response
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // If limiter is not configured (e.g., in development without Redis), allow all requests
  if (!limiter) {
    return { success: true, limit: 999, remaining: 999, reset: Date.now() };
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return { success, limit, remaining, reset };
}

/**
 * Create rate limit error response
 */
export function createRateLimitResponse(reset: number) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Trop de requêtes. Veuillez réessayer plus tard.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}
