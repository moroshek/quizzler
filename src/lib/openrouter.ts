import { OpenRouter } from 'openrouter-sdk';

const openrouterKey = import.meta.env.VITE_OPENROUTER_KEY;
const RATE_LIMIT = 5; // Requests per minute per user

class TokenBucket {
  private buckets = new Map&lt;string, { tokens: number; lastRefill: number }&gt;();

  consume(userId: string): boolean {
    const now = Date.now();
    if (!this.buckets.has(userId)) {
      this.buckets.set(userId, { tokens: RATE_LIMIT, lastRefill: now });
    }

    const bucket = this.buckets.get(userId)!;
    const timePassed = now - bucket.lastRefill;
    const refillAmount = Math.floor(timePassed / 60000); // 1 token per minute
    
    bucket.tokens = Math.min(
      RATE_LIMIT,
      bucket.tokens + refillAmount
    );
    bucket.lastRefill = now;

    if (bucket.tokens &lt; 1) return false;
    
    bucket.tokens -= 1;
    return true;
  }
}

export const rateLimiter = new TokenBucket();

export const openrouter = new OpenRouter({
  apiKey: openrouterKey,
  beforeRequest: (userId) => {
    if (!rateLimiter.consume(userId)) {
      throw new Error('Rate limit exceeded - please try again later');
    }
  }
});
