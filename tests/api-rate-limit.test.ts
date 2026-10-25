import assert from 'node:assert/strict';
import { InMemoryRateLimiter } from '../src/services/ApiRateLimit.ts';

const limiter = new InMemoryRateLimiter(2, 60_000);

const first = limiter.consume('client-a', 1_000);
assert.equal(first.allowed, true);
assert.equal(first.limit, 2);
assert.equal(first.remaining, 1);
assert.equal(first.resetAt, 61_000);
assert.equal(first.retryAfterSeconds, 0);

const second = limiter.consume('client-a', 1_001);
assert.equal(second.allowed, true);
assert.equal(second.remaining, 0);

const blocked = limiter.consume('client-a', 1_002);
assert.equal(blocked.allowed, false);
assert.equal(blocked.remaining, 0);
assert.equal(blocked.resetAt, 61_000);
assert.equal(blocked.retryAfterSeconds, 60);

const independentClient = limiter.consume('client-b', 1_002);
assert.equal(independentClient.allowed, true, 'Rate-limit buckets must be independent by client key');
assert.equal(independentClient.remaining, 1);

const afterWindow = limiter.consume('client-a', 61_000);
assert.equal(afterWindow.allowed, true, 'Expired timestamps should no longer count');
assert.equal(afterWindow.remaining, 0, 'The second request is still inside the rolling window at this timestamp');

const nextBoundary = limiter.consume('client-a', 61_001);
assert.equal(nextBoundary.allowed, true, 'The second request should expire at its own window boundary');
assert.equal(nextBoundary.remaining, 0);

const invalidKeyLimiter = new InMemoryRateLimiter(1, 1000);
assert.equal(invalidKeyLimiter.consume('', 10).allowed, true);
assert.equal(invalidKeyLimiter.consume('   ', 11).allowed, false, 'Empty keys should share a safe fallback bucket');

const bounded = new InMemoryRateLimiter(1, 10, 2);
assert.equal(bounded.consume('client-a', 1).allowed, true);
assert.equal(bounded.consume('client-b', 2).allowed, true);
assert.equal(bounded.consume('client-c', 3).allowed, true);
assert.equal(bounded.consume('client-d', 4).allowed, true);
assert.equal(bounded.consume('client-a', 5).allowed, true, 'A previously evicted bucket can be recreated within the configured storage bound');

assert.throws(() => new InMemoryRateLimiter(0, 1000), /maxRequests/);
assert.throws(() => new InMemoryRateLimiter(1, 0), /windowMs/);
assert.throws(() => new InMemoryRateLimiter(1, 1000, 0), /maxTrackedKeys/);
assert.throws(() => limiter.consume('client-a', Number.NaN), /finite timestamp/);

console.log('API rate-limit sliding window, client isolation, retry time, and bounded storage checks passed.');
