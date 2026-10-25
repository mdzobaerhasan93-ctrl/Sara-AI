import assert from 'node:assert/strict';
import {
  parseAllowedGitHubUsers,
  signGitHubSession,
  verifyGitHubSession,
} from '../src/services/GitHubOAuthService.ts';

const secret = 'test-session-secret-with-at-least-32-characters';
const now = Date.UTC(2026, 9, 25, 0, 0, 0);
const allowlist = parseAllowedGitHubUsers('Zobaer, mdzobaerhasan93-ctrl, zobaer, invalid username, ,');

assert.deepEqual(allowlist, ['zobaer', 'mdzobaerhasan93-ctrl']);
assert.deepEqual(parseAllowedGitHubUsers(undefined), []);
assert.deepEqual(parseAllowedGitHubUsers('***,another user'), []);

const signed = signGitHubSession('MdZobaerHasan93-Ctrl', secret, now, 3600);
assert.ok(signed);
assert.equal(
  verifyGitHubSession(signed || undefined, secret, ['mdzobaerhasan93-ctrl'], now)?.login,
  'mdzobaerhasan93-ctrl',
);
assert.equal(
  verifyGitHubSession(signed || undefined, secret, ['someone-else'], now),
  null,
  'A valid signed cookie must still satisfy the current user allowlist',
);
assert.equal(
  verifyGitHubSession(signed || undefined, 'wrong-secret-with-more-than-32-characters', ['mdzobaerhasan93-ctrl'], now),
  null,
  'Wrong signing secrets must reject the cookie',
);

const tampered = signed ? signed.slice(0, -1) + (signed.endsWith('A') ? 'B' : 'A') : undefined;
assert.equal(verifyGitHubSession(tampered, secret, ['mdzobaerhasan93-ctrl'], now), null);

const expired = signGitHubSession('mdzobaerhasan93-ctrl', secret, now, 60);
assert.equal(
  verifyGitHubSession(expired || undefined, secret, ['mdzobaerhasan93-ctrl'], now + 61_000),
  null,
  'Expired cookies must be rejected',
);

assert.equal(signGitHubSession('not a valid login', secret, now), null);
assert.equal(signGitHubSession('zobaer', 'short', now), null);
assert.equal(signGitHubSession('zobaer', secret, now, 59), null);
assert.equal(signGitHubSession('zobaer', secret, now, 8 * 60 * 60 + 1), null);

assert.equal(verifyGitHubSession(undefined, secret, ['zobaer'], now), null);
assert.equal(verifyGitHubSession(signed || undefined, undefined, ['zobaer'], now), null);
assert.equal(verifyGitHubSession(signed || undefined, secret, [], now), null);

console.log('GitHub OAuth allowlist and signed session checks passed.');
