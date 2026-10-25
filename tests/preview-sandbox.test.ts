import assert from 'node:assert/strict';
import {
  buildSandboxedPreviewHtml,
  PREVIEW_CONTENT_SECURITY_POLICY,
} from '../src/services/PreviewSandbox.ts';

const original = '<!doctype html><html><head><title>Demo</title></head><body><button onclick="change()">Run</button><script>function change(){document.body.dataset.changed="1"}</script></body></html>';
const sanitized = buildSandboxedPreviewHtml(original);

assert.ok(sanitized.startsWith('<!doctype html>'));
assert.ok(sanitized.indexOf('Content-Security-Policy') < sanitized.indexOf('<title>'));
assert.match(sanitized, /default-src 'none'/);
assert.match(PREVIEW_CONTENT_SECURITY_POLICY, /connect-src 'none'/);
assert.match(PREVIEW_CONTENT_SECURITY_POLICY, /form-action 'none'/);
assert.match(PREVIEW_CONTENT_SECURITY_POLICY, /frame-src 'none'/);
assert.match(PREVIEW_CONTENT_SECURITY_POLICY, /base-uri 'none'/);
assert.doesNotMatch(PREVIEW_CONTENT_SECURITY_POLICY, /connect-src [^;]*(?:https?:|\*)/);

const missingHead = buildSandboxedPreviewHtml('<html><body><p>demo</p><script>run()</script></body></html>');
assert.ok(missingHead.includes('<head><meta http-equiv="Content-Security-Policy"'));
assert.ok(missingHead.indexOf('Content-Security-Policy') < missingHead.indexOf('<body>'));

const fragment = buildSandboxedPreviewHtml('<button>hello</button><script>alert(1)</script>');
assert.ok(fragment.startsWith('<!doctype html><html><head>'));
assert.ok(fragment.indexOf('Content-Security-Policy') < fragment.indexOf('<script>'));

const empty = buildSandboxedPreviewHtml('');
assert.match(empty, /Preview unavailable/);
assert.match(empty, /No preview HTML was provided/);

const oversized = buildSandboxedPreviewHtml('<div>' + 'x'.repeat(500_001) + '</div>');
assert.match(oversized, /exceeds the allowed size limit/);
assert.ok(!oversized.includes('x'.repeat(500)));

const escaped = buildSandboxedPreviewHtml('<'.repeat(500_001));
assert.match(escaped, /Preview unavailable/);

console.log('Generated preview sandbox CSP and size-limit checks passed.');
