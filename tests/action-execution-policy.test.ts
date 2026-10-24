import assert from 'node:assert/strict';
import { decideActionExecutionRequest } from '../src/services/ActionExecutionPolicy.ts';

const unimplementedActions = [
  'send_email',
  'create_calendar_event',
  'github_action',
  'deploy_project',
  'launch_app',
  'unknown_action',
];

for (const action of unimplementedActions) {
  const decision = decideActionExecutionRequest({
    actionId: 'test-action-1',
    action,
    service: 'External Service',
    details: {},
  });

  if (decision.httpStatus !== 501) {
    throw new Error(`${action} must remain unavailable without a real integration`);
  }
  assert.equal(decision.response.success, false);
  assert.equal(decision.response.status, 'NOT_IMPLEMENTED');
  assert.equal(decision.response.actionId, 'test-action-1');
  assert.match(decision.response.error, /কোনো কাজ সম্পন্ন করা হয়নি/);
  assert.ok(!('executedAt' in decision.response), 'Unavailable actions must not include an execution timestamp');
}

const invalidRequests: unknown[] = [
  null,
  [],
  {},
  { actionId: 'test-action-1' },
  { action: 'send_email' },
  { actionId: '', action: 'send_email' },
  { actionId: 'test-action-1', action: '' },
  { actionId: 'x'.repeat(201), action: 'send_email' },
  { actionId: 'test-action-1', action: 'x'.repeat(121) },
];

for (const request of invalidRequests) {
  const decision = decideActionExecutionRequest(request);
  if (decision.httpStatus !== 400) {
    throw new Error('Malformed action requests should be rejected');
  }
  assert.equal(decision.response.success, false);
  assert.equal(decision.response.status, 'INVALID_REQUEST');
}

console.log('Action execution policy checks passed.');
