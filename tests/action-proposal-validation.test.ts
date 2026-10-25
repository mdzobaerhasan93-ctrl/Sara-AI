import assert from 'node:assert/strict';
import { validateActionProposal } from '../src/services/ActionProposalValidation.ts';

const valid = validateActionProposal(JSON.stringify({
  action: 'github_action',
  service: 'GitHub Actions',
  title: 'Run release workflow',
  risk: 'high',
  details: {
    repo: 'example-org/release-workflows',
    workflow: 'release.yml',
    ref: 'main',
    inputs: {
      environment: 'staging',
      dry_run: true,
    },
  },
}));

assert.ok(valid);
assert.equal(valid?.action, 'github_action');
assert.equal(valid?.risk, 'high');
assert.deepEqual(valid?.details.inputs, { environment: 'staging', dry_run: true });

const invalidInputs: unknown[] = [
  null,
  [],
  {},
  'not json',
  JSON.stringify([]),
  JSON.stringify({ action: 'run_arbitrary_shell', service: 'Local', title: 'Run command', details: {} }),
  JSON.stringify({ action: 'github_action', title: 'Missing service', details: {} }),
  JSON.stringify({ action: 'github_action', service: 'GitHub', title: '', details: {} }),
  JSON.stringify({ action: 'github_action', service: 'GitHub', title: 'Missing details', details: 'inputs' }),
  JSON.stringify({ action: 'github_action', service: 'GitHub', title: 'Array details', details: [] }),
  'x'.repeat(12_001),
];

for (const input of invalidInputs) {
  assert.equal(validateActionProposal(input), null, 'Invalid or oversized proposals must be rejected');
}

const fallbackRisk = validateActionProposal(JSON.stringify({
  action: 'send_email',
  service: 'Gmail',
  title: 'Send email',
  risk: 'critical',
  details: { to: 'example@example.com' },
}));
assert.equal(fallbackRisk?.risk, 'medium', 'Unknown risk labels should be normalized to medium');

const oversizedFields = validateActionProposal(JSON.stringify({
  action: 'send_email',
  service: 'Gmail',
  title: 'Bound detail strings',
  details: { body: 'x'.repeat(2500) },
}));
assert.ok(oversizedFields);
assert.equal((oversizedFields?.details.body as string).length, 2000);

const manyKeys = validateActionProposal(JSON.stringify({
  action: 'github_action',
  service: 'GitHub Actions',
  title: 'Bound detail count',
  details: Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`key${i}`, i])),
}));
assert.ok(manyKeys);
assert.equal(Object.keys(manyKeys?.details || {}).length, 20);

const prototypeKeys = validateActionProposal(
  '{"action":"github_action","service":"GitHub Actions","title":"Ignore prototype keys","details":{"safe":"yes","__proto__":{"polluted":"true"},"constructor":"bad","prototype":"bad"}}',
);
assert.ok(prototypeKeys);
assert.deepEqual(prototypeKeys?.details, { safe: 'yes' });
assert.equal(({} as Record<string, unknown>).polluted, undefined);

const nested = validateActionProposal(JSON.stringify({
  action: 'github_action',
  service: 'GitHub Actions',
  title: 'Keep safe nested inputs',
  details: { inputs: { environment: 'staging', count: 2 } },
}));
assert.deepEqual(nested?.details.inputs, { environment: 'staging', count: 2 });

console.log('Action proposal validation and sanitization checks passed.');
