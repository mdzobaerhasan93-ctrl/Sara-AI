const MAX_PREVIEW_HTML_LENGTH = 500_000;

const PREVIEW_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline' https://cdn.tailwindcss.com",
  "style-src 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com",
  "img-src data: blob:",
  "font-src data: https://fonts.gstatic.com",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "media-src data: blob:",
].join('; ');

const CSP_META = `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeErrorDocument(message: string): string {
  return `<!doctype html><html><head>${CSP_META}<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main><h1>Preview unavailable</h1><p>${escapeHtml(message)}</p></main></body></html>`;
}

/**
 * Adds a restrictive Content Security Policy before any generated markup and
 * bounds the amount of HTML sent to the iframe. The iframe itself must also
 * omit allow-same-origin so the preview receives an opaque origin.
 */
export function buildSandboxedPreviewHtml(input: unknown): string {
  if (typeof input !== 'string' || !input.trim()) {
    return safeErrorDocument('No preview HTML was provided.');
  }
  if (input.length > MAX_PREVIEW_HTML_LENGTH) {
    return safeErrorDocument('The generated preview exceeds the allowed size limit.');
  }

  const html = input.trim();
  const headMatch = /<head(?:\s[^>]*)?>/i.exec(html);
  if (headMatch && typeof headMatch.index === 'number') {
    const insertAt = headMatch.index + headMatch[0].length;
    return `${html.slice(0, insertAt)}${CSP_META}${html.slice(insertAt)}`;
  }

  const htmlMatch = /<html(?:\s[^>]*)?>/i.exec(html);
  if (htmlMatch && typeof htmlMatch.index === 'number') {
    const insertAt = htmlMatch.index + htmlMatch[0].length;
    return `${html.slice(0, insertAt)}<head>${CSP_META}</head>${html.slice(insertAt)}`;
  }

  return `<!doctype html><html><head>${CSP_META}<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${html}</body></html>`;
}

export const PREVIEW_CONTENT_SECURITY_POLICY = PREVIEW_CSP;
