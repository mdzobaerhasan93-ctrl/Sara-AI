export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

interface RateBucket {
  timestamps: number[];
}

const DEFAULT_MAX_TRACKED_KEYS = 5000;
const CLEANUP_INTERVAL_MS = 10_000;

/**
 * In-memory sliding-window limiter for a single server process/instance.
 * It is deliberately bounded and makes no claim to coordinate across serverless
 * instances. Use a shared store for distributed enforcement in production.
 */
export class InMemoryRateLimiter {
  private readonly buckets = new Map<string, RateBucket>();
  private lastCleanupAt = 0;
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly maxTrackedKeys: number;

  constructor(maxRequests: number, windowMs: number, maxTrackedKeys = DEFAULT_MAX_TRACKED_KEYS) {
    if (!Number.isSafeInteger(maxRequests) || maxRequests < 1) {
      throw new Error('maxRequests must be a positive integer.');
    }
    if (!Number.isSafeInteger(windowMs) || windowMs < 1) {
      throw new Error('windowMs must be a positive integer.');
    }
    if (!Number.isSafeInteger(maxTrackedKeys) || maxTrackedKeys < 1) {
      throw new Error('maxTrackedKeys must be a positive integer.');
    }

    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.maxTrackedKeys = maxTrackedKeys;
  }

  consume(keyInput: string, now = Date.now()): RateLimitDecision {
    if (!Number.isFinite(now)) {
      throw new Error('now must be a finite timestamp.');
    }

    const key = typeof keyInput === 'string' && keyInput.trim()
      ? keyInput.trim().slice(0, 128)
      : 'unknown';
    this.cleanupExpired(now);

    const cutoff = now - this.windowMs;
    const existing = this.buckets.get(key);
    const timestamps = (existing?.timestamps || []).filter((timestamp) => timestamp > cutoff && timestamp <= now);

    if (!existing && this.buckets.size >= this.maxTrackedKeys) {
      const oldestKey = this.buckets.keys().next().value;
      if (typeof oldestKey === 'string') this.buckets.delete(oldestKey);
    }

    const oldestTimestamp = timestamps.length ? Math.min(...timestamps) : now;
    const resetAt = oldestTimestamp + this.windowMs;
    const allowed = timestamps.length < this.maxRequests;

    if (allowed) timestamps.push(now);

    // Refresh insertion order, making the Map act as a bounded LRU cache.
    this.buckets.delete(key);
    this.buckets.set(key, { timestamps });

    const nextOldest = timestamps.length ? Math.min(...timestamps) : now;
    const nextResetAt = nextOldest + this.windowMs;
    const retryAfterSeconds = allowed
      ? 0
      : Math.max(1, Math.ceil((resetAt - now) / 1000));

    return {
      allowed,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - timestamps.length),
      resetAt: allowed ? nextResetAt : resetAt,
      retryAfterSeconds,
    };
  }

  private cleanupExpired(now: number): void {
    if (now - this.lastCleanupAt < CLEANUP_INTERVAL_MS && this.buckets.size < this.maxTrackedKeys) {
      return;
    }

    const cutoff = now - this.windowMs;
    for (const [key, bucket] of this.buckets) {
      const timestamps = bucket.timestamps.filter((timestamp) => timestamp > cutoff && timestamp <= now);
      if (timestamps.length === 0) {
        this.buckets.delete(key);
      } else if (timestamps.length !== bucket.timestamps.length) {
        this.buckets.set(key, { timestamps });
      }
    }
    this.lastCleanupAt = now;
  }
}
