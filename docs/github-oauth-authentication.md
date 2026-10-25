# GitHub OAuth sign-in and workflow access

Sara's sign-in modal uses GitHub OAuth instead of a simulated email/password form. The server validates the OAuth state, exchanges the one-time authorization code server-side, checks the returned GitHub account against a server-side username allowlist, and issues an eight-hour signed HttpOnly session cookie.

## Required server environment

```dotenv
APP_URL="https://your-app.example.com"
GITHUB_OAUTH_CLIENT_ID="your-oauth-app-client-id"
GITHUB_OAUTH_CLIENT_SECRET="your-oauth-app-client-secret"
GITHUB_OAUTH_CALLBACK_URL="https://your-app.example.com/api/auth/github/callback"
SARA_SESSION_SECRET="generate-a-random-secret-at-least-32-characters-long"
SARA_GITHUB_ALLOWED_USERS="your-github-username"
```

Register the callback URL exactly as shown in the GitHub OAuth App settings. The callback URL and `APP_URL` must have the same origin; production URLs must use HTTPS. `SARA_SESSION_SECRET` is used only by the server to sign session cookies. Use a cryptographically random value of at least 32 characters and keep it out of browser code.

The username allowlist is required and fails closed when empty. Only listed GitHub users may sign in. Use lower-case, comma-separated GitHub usernames without spaces inside a username.

## Workflow dispatch protection

The server registers authentication middleware for `POST /api/github-actions/dispatch` before API routes. After this and the GitHub Actions integration are merged, dispatch additionally requires:
- a valid, unexpired signed session cookie for an allowlisted GitHub user;
- a same-origin `Origin` header matching `APP_URL`;
- the workflow approval request and the existing repository/workflow allowlists.

Session cookies use `HttpOnly`, `SameSite=Lax`, and `Secure` in production. The logout endpoint clears the session cookie and rejects cross-origin logout attempts. OAuth state is random, stored in an HttpOnly short-lived cookie, and compared before the callback exchanges a code.

The GitHub OAuth access token is not persisted. The separate `GITHUB_ACTIONS_TOKEN` remains a server-only credential used to dispatch the allowlisted workflow. Do not expose either secret to the frontend.

## Important limits

This app uses a username allowlist, not GitHub organization membership/role checks. Protect the OAuth App client secret and session secret, keep the user allowlist narrow, and rotate secrets if exposed. A successful sign-in does not bypass the GitHub Actions repository/workflow allowlist.
