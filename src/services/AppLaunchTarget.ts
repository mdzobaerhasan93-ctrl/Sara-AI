export interface AppLaunchInput {
  name: string;
  launchUri?: unknown;
  webFallbackUrl?: unknown;
}

export type AppLaunchTargetKind = 'web' | 'app-scheme' | 'search';

export interface ResolvedAppLaunchTarget {
  url: string;
  kind: AppLaunchTargetKind;
}

const BLOCKED_SCHEMES = new Set([
  'javascript',
  'data',
  'vbscript',
  'file',
  'blob',
  'about',
  'view-source',
  'chrome',
  'chrome-extension',
  'resource',
  'intent',
]);

function parseSafeHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const candidate = value.trim();

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:') return null;
    if (!url.hostname || url.username || url.password) return null;
    if (url.href.length > 2048) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function parseSafeAppScheme(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) return null;
  if (/[\u0000-\u001f\u007f\s\\]/.test(value)) return null;

  const match = /^([a-z][a-z0-9+.-]*):\/\/([^\s]*)$/i.exec(value);
  if (!match) return null;

  const scheme = match[1].toLowerCase();
  if (BLOCKED_SCHEMES.has(scheme) || scheme === 'http' || scheme === 'https') return null;

  // App links may contain path/query data, but never credentials, control
  // characters, or executable browser schemes.
  if (value.includes('\\')) return null;
  return value;
}

function createSearchFallback(nameInput: unknown): ResolvedAppLaunchTarget {
  const name = typeof nameInput === 'string' ? nameInput.trim().slice(0, 120) : '';
  return {
    url: `https://www.google.com/search?q=${encodeURIComponent(name || 'app')}`,
    kind: 'search',
  };
}

/**
 * Resolves an app launch destination from browser-persisted app metadata.
 * Web destinations must be HTTPS. On mobile, custom app schemes are allowed
 * except schemes that can execute browser code or access local files/system UI.
 */
export function resolveAppLaunchTarget(
  app: AppLaunchInput,
  isMobile: boolean,
): ResolvedAppLaunchTarget {
  if (!isMobile) {
    const fallback = parseSafeHttpsUrl(app.webFallbackUrl);
    if (fallback) return { url: fallback, kind: 'web' };

    const launchWebUrl = parseSafeHttpsUrl(app.launchUri);
    if (launchWebUrl) return { url: launchWebUrl, kind: 'web' };

    return createSearchFallback(app.name);
  }

  const launchWebUrl = parseSafeHttpsUrl(app.launchUri);
  if (launchWebUrl) return { url: launchWebUrl, kind: 'web' };

  const appScheme = parseSafeAppScheme(app.launchUri);
  if (appScheme) return { url: appScheme, kind: 'app-scheme' };

  const fallback = parseSafeHttpsUrl(app.webFallbackUrl);
  if (fallback) return { url: fallback, kind: 'web' };

  return createSearchFallback(app.name);
}
