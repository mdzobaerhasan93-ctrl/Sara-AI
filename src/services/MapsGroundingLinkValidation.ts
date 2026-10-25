export interface SafeMapsGroundingLink {
  title: string;
  uri: string;
}

const MAX_INPUT_CHUNKS = 100;
const MAX_OUTPUT_LINKS = 20;
const MAX_TITLE_LENGTH = 160;
const MAX_URI_LENGTH = 2048;
const CONTROL_OR_WHITESPACE = /[\u0000-\u0020\u007F]/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeTitle(value: unknown): string {
  if (typeof value !== 'string') return 'Google Maps Location';
  const title = Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TITLE_LENGTH);
  return title || 'Google Maps Location';
}

function sanitizeMapsUri(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const input = value.trim();
  if (!input || input.length > MAX_URI_LENGTH || CONTROL_OR_WHITESPACE.test(input)) return null;

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.port) {
    return null;
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === 'maps.app.goo.gl') {
    return url.toString();
  }
  if (hostname === 'maps.google.com') {
    return url.toString();
  }

  const isGoogleHost = hostname === 'google.com' || hostname.endsWith('.google.com');
  const isMapsPath = url.pathname === '/maps' || url.pathname.startsWith('/maps/');
  if (!isGoogleHost || !isMapsPath) return null;

  return url.toString();
}

/**
 * Converts provider grounding chunks into safe, bounded Google Maps links.
 * Non-HTTPS URLs, URLs outside recognized Google Maps hosts/paths, malformed
 * values, duplicate destinations, and oversized input are discarded.
 */
export function sanitizeMapsGroundingLinks(input: unknown): SafeMapsGroundingLink[] {
  if (!Array.isArray(input)) return [];

  const links: SafeMapsGroundingLink[] = [];
  const seenUris = new Set<string>();

  for (const chunk of input.slice(0, MAX_INPUT_CHUNKS)) {
    if (!isRecord(chunk) || !isRecord(chunk.maps)) continue;
    const uri = sanitizeMapsUri(chunk.maps.uri);
    if (!uri || seenUris.has(uri)) continue;

    seenUris.add(uri);
    links.push({
      title: normalizeTitle(chunk.maps.title),
      uri,
    });
    if (links.length >= MAX_OUTPUT_LINKS) break;
  }

  return links;
}
