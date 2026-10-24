export interface GitHubWorkflowDispatchInput {
  actionId: unknown;
  approved: unknown;
  repository: unknown;
  workflow: unknown;
  ref: unknown;
  inputs?: unknown;
}

export interface GitHubWorkflowRunSummary {
  id: number;
  runNumber: number;
  status: string;
  conclusion: string | null;
  url: string;
  createdAt: string;
  workflowId: number;
  headBranch: string;
}

export type GitHubWorkflowDispatchResult =
  | {
      success: false;
      httpStatus: 400 | 401 | 403 | 404 | 500 | 502 | 503 | 504;
      status: string;
      error: string;
      actionId?: string;
      run?: GitHubWorkflowRunSummary;
    }
  | {
      success: true;
      httpStatus: 200 | 202;
      status: 'queued' | 'in_progress' | 'completed';
      actionId: string;
      message: string;
      run: GitHubWorkflowRunSummary;
    };

export interface GitHubActionsConfig {
  token?: string;
  allowedRepositories?: string;
  allowedWorkflows?: string;
  fetchImpl?: typeof fetch;
  wait?: (milliseconds: number) => Promise<void>;
  verificationAttempts?: number;
  verificationIntervalMs?: number;
}

const DEFAULT_ATTEMPTS = 6;
const DEFAULT_INTERVAL_MS = 1000;

function failure(
  httpStatus: 400 | 401 | 403 | 404 | 500 | 502 | 503 | 504,
  status: string,
  error: string,
  actionId?: string,
  run?: GitHubWorkflowRunSummary,
): GitHubWorkflowDispatchResult {
  return { success: false, httpStatus, status, error, ...(actionId ? { actionId } : {}), ...(run ? { run } : {}) };
}

function parseList(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeRepository(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const repository = value.trim();
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9_.-]{1,100}$/.test(repository)) return null;
  if (repository.endsWith('.git') || repository.includes('..')) return null;
  return repository;
}

function normalizeWorkflow(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const workflow = value.trim();
  // Only workflow file basenames are supported, not arbitrary paths or URLs.
  if (!/^[A-Za-z0-9_.-]{1,100}\.ya?ml$/i.test(workflow)) return null;
  if (workflow.startsWith('.') || workflow.includes('..')) return null;
  return workflow;
}

function normalizeRef(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const ref = value.trim();
  if (
    !ref ||
    ref.length > 250 ||
    ref.startsWith('/') ||
    ref.endsWith('/') ||
    ref.includes('..') ||
    ref.includes('//') ||
    /[\s~^:?*\[\\]/.test(ref) ||
    ref.endsWith('.lock')
  ) {
    return null;
  }
  return ref;
}

function normalizeInputs(value: unknown): Record<string, string> | null {
  if (value === undefined || value === null) return {};
  if (!isRecord(value)) return null;

  const entries = Object.entries(value);
  if (entries.length > 20) return null;

  const result: Record<string, string> = {};
  for (const [key, raw] of entries) {
    if (!/^[A-Za-z_][A-Za-z0-9_-]{0,63}$/.test(key)) return null;
    if (typeof raw !== 'string' && typeof raw !== 'number' && typeof raw !== 'boolean') return null;
    const valueString = String(raw);
    if (valueString.length > 1000) return null;
    result[key] = valueString;
  }
  return result;
}

function isGitHubRun(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  return Number.isSafeInteger(value.id)
    && Number.isSafeInteger(value.run_number)
    && typeof value.status === 'string'
    && typeof value.html_url === 'string'
    && typeof value.created_at === 'string'
    && Number.isSafeInteger(value.workflow_id)
    && typeof value.head_branch === 'string';
}

function summarizeRun(run: Record<string, unknown>): GitHubWorkflowRunSummary {
  return {
    id: run.id as number,
    runNumber: run.run_number as number,
    status: run.status as string,
    conclusion: typeof run.conclusion === 'string' ? run.conclusion : null,
    url: run.html_url as string,
    createdAt: run.created_at as string,
    workflowId: run.workflow_id as number,
    headBranch: run.head_branch as string,
  };
}

/**
 * Dispatches one allowlisted workflow only after an explicit UI approval.
 *
 * The GitHub credential is read from server configuration and is never accepted
 * from the request body. A dispatch is considered verified only after GitHub's
 * Actions API exposes the newly-created run for the allowlisted workflow/ref.
 */
export async function dispatchGitHubWorkflow(
  request: GitHubWorkflowDispatchInput,
  config: GitHubActionsConfig = {},
): Promise<GitHubWorkflowDispatchResult> {
  const actionId = typeof request?.actionId === 'string' ? request.actionId.trim() : '';
  if (request?.approved !== true || !actionId || actionId.length > 200) {
    return failure(400, 'APPROVAL_REQUIRED', 'A valid action ID and explicit user approval are required. No workflow was dispatched.', actionId || undefined);
  }

  const repository = normalizeRepository(request.repository);
  const workflow = normalizeWorkflow(request.workflow);
  const ref = normalizeRef(request.ref);
  const inputs = normalizeInputs(request.inputs);

  if (!repository || !workflow || !ref || !inputs) {
    return failure(400, 'INVALID_REQUEST', 'Repository, workflow filename, ref, or workflow inputs are invalid. No workflow was dispatched.', actionId);
  }

  const token = config.token?.trim();
  if (!token) {
    return failure(503, 'GITHUB_NOT_CONFIGURED', 'GitHub Actions integration is not configured on the server. No workflow was dispatched.', actionId);
  }

  const allowedRepositories = parseList(config.allowedRepositories).map((item) => item.toLowerCase());
  const scopedWorkflow = `${repository.toLowerCase()}:${workflow.toLowerCase()}`;
  const allowedWorkflows = parseList(config.allowedWorkflows).map((item) => item.toLowerCase());

  if (!allowedRepositories.includes(repository.toLowerCase())) {
    return failure(403, 'REPOSITORY_NOT_ALLOWED', 'This repository is not in the server allowlist. No workflow was dispatched.', actionId);
  }
  if (!allowedWorkflows.includes(scopedWorkflow)) {
    return failure(403, 'WORKFLOW_NOT_ALLOWED', 'This workflow is not in the server allowlist. No workflow was dispatched.', actionId);
  }

  const fetchImpl = config.fetchImpl || fetch;
  const wait = config.wait || ((milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds)));
  const apiBase = `https://api.github.com/repos/${repository}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  try {
    const workflowResponse = await fetchImpl(
      `${apiBase}/actions/workflows/${encodeURIComponent(workflow)}`,
      { method: 'GET', headers },
    );

    if (workflowResponse.status === 404) {
      return failure(404, 'WORKFLOW_NOT_FOUND', 'GitHub could not find the configured workflow. Check the repository and workflow allowlist.', actionId);
    }
    if (workflowResponse.status === 401) {
      return failure(401, 'GITHUB_AUTH_FAILED', 'GitHub rejected the configured server credential. Check the token and its permissions.', actionId);
    }
    if (workflowResponse.status === 403) {
      return failure(403, 'GITHUB_PERMISSION_DENIED', 'The configured GitHub credential lacks permission to inspect workflows in this repository.', actionId);
    }
    if (!workflowResponse.ok) {
      return failure(502, 'GITHUB_API_ERROR', 'GitHub could not verify the configured workflow. No dispatch was attempted.', actionId);
    }

    const workflowData: unknown = await workflowResponse.json();
    if (!isRecord(workflowData) || !Number.isSafeInteger(workflowData.id) || workflowData.state !== 'active') {
      return failure(403, 'WORKFLOW_INACTIVE', 'The configured workflow is not active. No workflow was dispatched.', actionId);
    }
    const workflowId = workflowData.id as number;

    const dispatchStartedAt = Date.now();
    const dispatchResponse = await fetchImpl(
      `${apiBase}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ ref, inputs }),
      },
    );

    if (dispatchResponse.status === 401) {
      return failure(401, 'GITHUB_AUTH_FAILED', 'GitHub rejected the configured server credential. Check the token and its permissions.', actionId);
    }
    if (dispatchResponse.status === 403) {
      return failure(403, 'GITHUB_PERMISSION_DENIED', 'GitHub denied workflow dispatch. Check Actions write permission and repository access.', actionId);
    }
    if (dispatchResponse.status === 404) {
      return failure(404, 'WORKFLOW_NOT_FOUND', 'GitHub could not dispatch the configured workflow. No successful dispatch was confirmed.', actionId);
    }
    if (dispatchResponse.status !== 204 && !dispatchResponse.ok) {
      return failure(502, 'GITHUB_DISPATCH_FAILED', `GitHub did not accept the workflow dispatch (HTTP ${dispatchResponse.status}).`, actionId);
    }

    const attempts = Math.max(1, Math.min(config.verificationAttempts ?? DEFAULT_ATTEMPTS, 10));
    const interval = Math.max(0, Math.min(config.verificationIntervalMs ?? DEFAULT_INTERVAL_MS, 5000));

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const runsResponse = await fetchImpl(
        `${apiBase}/actions/runs?event=workflow_dispatch&branch=${encodeURIComponent(ref)}&per_page=20`,
        { method: 'GET', headers },
      );

      if (runsResponse.status === 401) {
        return failure(401, 'GITHUB_AUTH_FAILED', 'GitHub rejected the credential while verifying the workflow run. Dispatch may have been accepted; check GitHub before retrying.', actionId);
      }
      if (runsResponse.status === 403) {
        return failure(403, 'GITHUB_PERMISSION_DENIED', 'GitHub denied run verification. Dispatch may have been accepted; check GitHub before retrying.', actionId);
      }
      if (!runsResponse.ok) {
        return failure(502, 'RUN_VERIFICATION_FAILED', 'GitHub accepted the dispatch but the run status could not be verified. Check GitHub before retrying.', actionId);
      }

      const runsData: unknown = await runsResponse.json();
      const allRuns = isRecord(runsData) && Array.isArray(runsData.workflow_runs) ? runsData.workflow_runs : [];
      const match = allRuns
        .filter(isGitHubRun)
        .filter((run) => run.workflow_id === workflowId && run.head_branch === ref && run.event === 'workflow_dispatch')
        .filter((run) => {
          const createdAt = Date.parse(run.created_at as string);
          return Number.isFinite(createdAt) && createdAt >= dispatchStartedAt - 5000;
        })
        .sort((a, b) => Date.parse(b.created_at as string) - Date.parse(a.created_at as string))[0];

      if (match) {
        const run = summarizeRun(match);
        if (run.status === 'completed') {
          if (run.conclusion === 'success') {
            return {
              success: true,
              httpStatus: 200,
              status: 'completed',
              actionId,
              run,
              message: `GitHub Actions run #${run.runNumber} completed successfully and was verified by GitHub. ${run.url}`,
            };
          }
          return failure(502, 'WORKFLOW_FAILED', `GitHub Actions run #${run.runNumber} completed with conclusion "${run.conclusion || 'unknown'}". See verified run: ${run.url}`, actionId, run);
        }

        if (run.status === 'queued' || run.status === 'in_progress' || run.status === 'requested' || run.status === 'waiting' || run.status === 'pending') {
          return {
            success: true,
            httpStatus: 202,
            status: run.status === 'queued' || run.status === 'requested' || run.status === 'waiting' || run.status === 'pending' ? 'queued' : 'in_progress',
            actionId,
            run,
            message: `GitHub accepted the dispatch and verified run #${run.runNumber} (${run.status}). Completion is not yet verified. ${run.url}`,
          };
        }

        return failure(502, 'RUN_STATUS_UNKNOWN', `GitHub returned an unrecognized status for run #${run.runNumber}. See: ${run.url}`, actionId, run);
      }

      if (attempt + 1 < attempts && interval > 0) await wait(interval);
    }

    return failure(504, 'RUN_VERIFICATION_TIMEOUT', 'GitHub accepted the dispatch, but a matching run was not visible in time. Check the repository Actions page before retrying to avoid a duplicate run.', actionId);
  } catch {
    // Do not return raw exceptions: they can include request details and should
    // never expose the server-side token.
    return failure(502, 'GITHUB_CONNECTION_ERROR', 'Unable to contact GitHub or verify the workflow run. Check GitHub before retrying.', actionId);
  }
}
