import assert from 'node:assert/strict';
import { dispatchGitHubWorkflow } from '../src/services/GitHubActionsService.ts';

const config = {
  token: 'server-only-token',
  allowedRepositories: 'example-org/sara-automation',
  allowedWorkflows: 'example-org/sara-automation:release.yml',
  verificationAttempts: 2,
  verificationIntervalMs: 0,
};

const request = {
  actionId: 'approval-123',
  approved: true,
  repository: 'example-org/sara-automation',
  workflow: 'release.yml',
  ref: 'main',
  inputs: { environment: 'staging', dry_run: true },
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeFetch(run: Record<string, unknown> | null, calls: Array<{ url: string; init?: RequestInit }> = []) {
  let runListCalls = 0;
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.endsWith('/actions/workflows/release.yml')) {
      return jsonResponse({ id: 777, state: 'active' });
    }
    if (url.endsWith('/actions/workflows/release.yml/dispatches')) {
      return new Response(null, { status: 204 });
    }
    if (url.includes('/actions/runs?')) {
      runListCalls += 1;
      // The first read is the pre-dispatch snapshot; only later reads may
      // contain the newly created run that verifies this approval.
      return jsonResponse({ workflow_runs: runListCalls === 1 ? [] : (run ? [run] : []) });
    }
    return jsonResponse({ message: 'unexpected request' }, 500);
  };
  return { fetchImpl, calls };
}

const verifiedRun = {
  id: 99123,
  run_number: 18,
  status: 'in_progress',
  conclusion: null,
  html_url: 'https://github.com/example-org/sara-automation/actions/runs/99123',
  created_at: new Date().toISOString(),
  workflow_id: 777,
  head_branch: 'main',
  event: 'workflow_dispatch',
};

const approvalCalls: Array<{ url: string; init?: RequestInit }> = [];
const approvalRequired = await dispatchGitHubWorkflow(
  { ...request, approved: false },
  { ...config, fetchImpl: makeFetch(verifiedRun, approvalCalls).fetchImpl },
);
assert.equal(approvalRequired.success, false);
if (!approvalRequired.success) {
  assert.equal(approvalRequired.status, 'APPROVAL_REQUIRED');
  assert.equal(approvalRequired.httpStatus, 400);
}
assert.equal(approvalCalls.length, 0, 'No GitHub call is allowed before explicit approval');

const missingToken = await dispatchGitHubWorkflow(request, {
  ...config,
  token: '',
  fetchImpl: makeFetch(verifiedRun).fetchImpl,
});
assert.equal(missingToken.success, false);
if (!missingToken.success) assert.equal(missingToken.status, 'GITHUB_NOT_CONFIGURED');

const repoCalls: Array<{ url: string; init?: RequestInit }> = [];
const blockedRepository = await dispatchGitHubWorkflow(
  { ...request, repository: 'someone-else/private-repo' },
  { ...config, fetchImpl: makeFetch(verifiedRun, repoCalls).fetchImpl },
);
assert.equal(blockedRepository.success, false);
if (!blockedRepository.success) {
  assert.equal(blockedRepository.httpStatus, 403);
  assert.equal(blockedRepository.status, 'REPOSITORY_NOT_ALLOWED');
}
assert.equal(repoCalls.length, 0, 'Disallowed repositories must be rejected before calling GitHub');

const workflowCalls: Array<{ url: string; init?: RequestInit }> = [];
const blockedWorkflow = await dispatchGitHubWorkflow(
  { ...request, workflow: 'unknown.yml' },
  { ...config, fetchImpl: makeFetch(verifiedRun, workflowCalls).fetchImpl },
);
assert.equal(blockedWorkflow.success, false);
if (!blockedWorkflow.success) assert.equal(blockedWorkflow.status, 'WORKFLOW_NOT_ALLOWED');
assert.equal(workflowCalls.length, 0, 'Disallowed workflows must be rejected before calling GitHub');

for (const invalid of [
  { ...request, ref: '../main' },
  { ...request, ref: 'main;rm -rf' },
  { ...request, workflow: '../release.yml' },
  { ...request, inputs: { 'bad key': 'value' } },
  { ...request, inputs: { payload: 'x'.repeat(1001) } },
  { ...request, inputs: Object.fromEntries(Array.from({ length: 21 }, (_, i) => [`key${i}`, 'value'])) },
]) {
  const result = await dispatchGitHubWorkflow(invalid, {
    ...config,
    fetchImpl: makeFetch(verifiedRun).fetchImpl,
  });
  assert.equal(result.success, false, 'Invalid input should be rejected');
  if (!result.success) assert.equal(result.httpStatus, 400);
}

const calls: Array<{ url: string; init?: RequestInit }> = [];
const dispatched = await dispatchGitHubWorkflow(request, {
  ...config,
  fetchImpl: makeFetch(verifiedRun, calls).fetchImpl,
});
assert.equal(dispatched.success, true);
if (dispatched.success) {
  assert.equal(dispatched.httpStatus, 202);
  assert.equal(dispatched.status, 'in_progress');
  assert.equal(dispatched.run.id, 99123);
  assert.match(dispatched.message, /Completion is not yet verified/);
}
assert.equal(calls.length, 4, 'Expected workflow lookup, baseline snapshot, dispatch, then run verification');

const dispatchCall = calls.find((call) => call.init?.method === 'POST');
assert.ok(dispatchCall);
assert.equal((dispatchCall?.init?.headers as Record<string, string>).Authorization, 'Bearer server-only-token');
assert.deepEqual(JSON.parse(String(dispatchCall?.init?.body)), {
  ref: 'main',
  inputs: { environment: 'staging', dry_run: 'true' },
});
assert.ok(!String(dispatchCall?.init?.body).includes('server-only-token'), 'The token must never be sent in the JSON payload');
assert.ok(calls.every((call) => call.url.startsWith('https://api.github.com/repos/example-org/sara-automation/')));

const workflowFailedRun = {
  ...verifiedRun,
  status: 'completed',
  conclusion: 'failure',
};
const failedWorkflow = await dispatchGitHubWorkflow(request, {
  ...config,
  fetchImpl: makeFetch(workflowFailedRun).fetchImpl,
});
assert.equal(failedWorkflow.success, false);
if (!failedWorkflow.success) {
  assert.equal(failedWorkflow.status, 'WORKFLOW_FAILED');
  assert.equal(failedWorkflow.run?.id, 99123);
  assert.match(failedWorkflow.error, /completed with conclusion "failure"/);
}

const timeoutResult = await dispatchGitHubWorkflow(request, {
  ...config,
  verificationAttempts: 1,
  fetchImpl: makeFetch(null).fetchImpl,
});
assert.equal(timeoutResult.success, false);
if (!timeoutResult.success) {
  assert.equal(timeoutResult.httpStatus, 504);
  assert.equal(timeoutResult.status, 'RUN_VERIFICATION_TIMEOUT');
  assert.match(timeoutResult.error, /before retrying/);
}

const authCalls: Array<{ url: string; init?: RequestInit }> = [];
const authFailed = await dispatchGitHubWorkflow(request, {
  ...config,
  fetchImpl: async (input, init) => {
    authCalls.push({ url: String(input), init });
    return jsonResponse({ message: 'Bad credentials' }, 401);
  },
});
assert.equal(authFailed.success, false);
if (!authFailed.success) assert.equal(authFailed.status, 'GITHUB_AUTH_FAILED');
assert.equal(authCalls.length, 1, 'Dispatch must stop if workflow metadata auth fails');

console.log('GitHub Actions allowlist, approval, dispatch, authentication, and run verification checks passed.');
