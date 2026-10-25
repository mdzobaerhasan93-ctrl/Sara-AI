# API rate limits

Sara applies an in-memory sliding-window limit to the following AI or externally-backed endpoints:

| Endpoint | Limit per client key |
| --- | ---: |
| `POST /api/chat` | 20 requests / minute |
| `POST /api/agent-solve` | 4 requests / minute |
| `POST /api/think` | 10 requests / minute |
| `POST /api/daily-affirmation` | 10 requests / minute |
| `GET /api/weather` | 30 requests / minute |
| `POST /api/tts` | 20 requests / minute |
| `POST /api/maps-grounding` | 10 requests / minute |

When a limit is exceeded, the server returns HTTP `429` with `status: "TOO_MANY_REQUESTS"`, a `Retry-After` header, and `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.

## Scope and deployment limits

The key is Express's `req.ip`, which uses only the proxy configuration explicitly trusted by Express. Sara does not parse `X-Forwarded-For` directly, because untrusted clients can spoof that header.

The limiter stores up to 5,000 client keys per process and periodically removes expired buckets. This is a best-effort safety net for a single process/instance, not a global distributed quota. Serverless platforms may create multiple instances and reset in-memory state; deployments that need robust shared quotas should put a shared rate-limit store or gateway in front of these endpoints.

Limits are currently code-configured, not user-configurable. Tune them against real traffic and provider quotas before a public launch.
