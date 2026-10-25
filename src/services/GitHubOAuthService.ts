import { createHmac, timingSafeEqual } from 'node:crypto';

const MAX_LOGIN_LENGTH = 39;
const DEFAULT_SESSION_TTL_SECONDS = 8 * 60 * 60;

export interface GitHubSession {
  login: string;
  expiresAt: number;
}

function normalizeLogin(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const login = value.trim();
  if (!/^[A-Za-z0-9-]{1,39}$/.test(login) || login.length > MAX_LOGIN_LENGTH) return null;
  return login.toLowerCase();
}

export function parseAllowedGitHubUsers(value: string | undefined): string[] {
  return [...new Set((value || '')
    .split(',')
    .map(normalizeLogin)
    .filter((login): login is string => Boolean(login)))];
}

export function signGitHubSession(
  loginInput: string,
  secret: string,
  nowMs = Date.now(),
  ttlSeconds = DEFAULT_SESSION_TTL_SECONDS,
): string | null {
  const login = normalizeLogin(loginInput);
  if (!login || typeof secret !== 'string' || secret.length < 32) return null;
  if (!Number.isFinite(nowMs) || !Number.isFinite(ttlSeconds) || ttlSeconds < 60 || ttlSeconds > DEFAULT_SESSION_TTL_SECONDS) {
    return null;
  }

  const payload = Buffer.from(JSON.stringify({
    login,
    exp: Math.floor(nowMs / 1000) + ttlSeconds,
  })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyGitHubSession(
  cookieValue: string | undefined,
  secret: string | undefined,
  allowedUsers: string[],
  nowMs = Date.now(),
): GitHubSession | null {
  if (!cookieValue || !secret || secret.length < 32 || !Number.isFinite(nowMs) || allowedUsers.length === 0) {
    return null;
  }

  const parts = cookieValue.split('.');
  if (parts.length !== 2 || parts.some((part) => !part || part.length > 1024)) return null;

  const [payload, signature] = parts;
  const expectedSignature = createHmac('sha256', secret).update(payload).digest();
  let suppliedSignature: Buffer;
  try {
    suppliedSignature = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (suppliedSignature.length !== expectedSignature.length) return null;
  if (!timingSafeEqual(expectedSignature, suppliedSignature)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
    const login = normalizeLogin(decoded.login);
    if (!login || typeof decoded.exp !== 'number' || !Number.isSafeInteger(decoded.exp)) return null;
    if (decoded.exp <= Math.floor(nowMs / 1000)) return null;

    const normalizedAllowlist = new Set(allowedUsers.map((user) => user.toLowerCase()));
    if (!normalizedAllowlist.has(login)) return null;

    return { login, expiresAt: decoded.exp * 1000 };
  } catch {
    return null;
  }
}
