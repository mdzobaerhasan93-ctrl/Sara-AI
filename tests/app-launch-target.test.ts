import assert from 'node:assert/strict';
import { resolveAppLaunchTarget } from '../src/services/AppLaunchTarget.ts';

const instagramOnMobile = resolveAppLaunchTarget({
  name: 'Instagram',
  launchUri: 'instagram://app',
  webFallbackUrl: 'https://www.instagram.com',
}, true);
assert.deepEqual(instagramOnMobile, {
  url: 'instagram://app',
  kind: 'app-scheme',
});

const instagramOnDesktop = resolveAppLaunchTarget({
  name: 'Instagram',
  launchUri: 'instagram://app',
  webFallbackUrl: 'https://www.instagram.com',
}, false);
assert.deepEqual(instagramOnDesktop, {
  url: 'https://www.instagram.com/',
  kind: 'web',
});

const secureWebUriOnMobile = resolveAppLaunchTarget({
  name: 'Video',
  launchUri: 'https://video.example/watch?id=123',
  webFallbackUrl: 'https://fallback.example',
}, true);
assert.equal(secureWebUriOnMobile.kind, 'web');
assert.equal(secureWebUriOnMobile.url, 'https://video.example/watch?id=123');

const unsafeLaunches = [
  'javascript:alert(1)',
  'javascript://alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'data://evil',
  'file:///etc/passwd',
  'blob:https://example.com/id',
  'about:blank',
  'view-source:https://example.com',
  'intent://scan/#Intent;scheme=zxing;end',
  'http://insecure.example',
  'https://good.example@evil.example/path',
  'https://example.com\\@evil.example',
];

for (const launchUri of unsafeLaunches) {
  const resolved = resolveAppLaunchTarget({
    name: 'Custom <App>',
    launchUri,
    webFallbackUrl: 'javascript:alert(2)',
  }, true);
  assert.equal(resolved.kind, 'search', `Unsafe launch target must not be opened: ${launchUri}`);
  assert.equal(new URL(resolved.url).origin, 'https://www.google.com');
  assert.ok(resolved.url.includes(encodeURIComponent('Custom <App>')));
}

const unsafeFallbackDesktop = resolveAppLaunchTarget({
  name: 'My Tool',
  launchUri: 'customtool://open',
  webFallbackUrl: 'javascript:alert(1)',
}, false);
assert.equal(unsafeFallbackDesktop.kind, 'search');
assert.equal(new URL(unsafeFallbackDesktop.url).origin, 'https://www.google.com');

const safeFallbackWhenMobileSchemeInvalid = resolveAppLaunchTarget({
  name: 'Safe fallback',
  launchUri: 'javascript://alert(1)',
  webFallbackUrl: 'https://safe.example/app',
}, true);
assert.deepEqual(safeFallbackWhenMobileSchemeInvalid, {
  url: 'https://safe.example/app',
  kind: 'web',
});

const invalidValues = [
  null,
  5,
  '',
  'instagram://app with spaces',
  'instagram://app\\path',
  '1scheme://host',
];
for (const launchUri of invalidValues) {
  const result = resolveAppLaunchTarget({
    name: 'Fallback app',
    launchUri,
    webFallbackUrl: '',
  }, true);
  assert.equal(result.kind, 'search');
}

const oversizedUrl = resolveAppLaunchTarget({
  name: 'Very long app',
  launchUri: 'https://example.com/' + 'x'.repeat(3000),
  webFallbackUrl: '',
}, false);
assert.equal(oversizedUrl.kind, 'search');

console.log('Custom app launch target validation and unsafe scheme rejection checks passed.');
