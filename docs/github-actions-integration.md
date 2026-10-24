# GitHub Actions integration

Sara can dispatch a GitHub Actions workflow only when the user approves a `github_action` proposal and both the repository and workflow are present in the server-side allowlists.

## 1. Configure a fine-grained token

Create a GitHub fine-grained personal access token scoped to only the repository Sara may dispatch. Grant **Actions: Read and write**. Keep the token in the server's environment/secrets, not in browser code or local storage.

Configure these server environment variables:

```dotenv
GITHUB_ACTIONS_TOKEN="your-fine-grained-token"
GITHUB_ALLOWED_REPOSITORIES="example-org/sara-automation"
GITHUB_ALLOWED_WORKFLOWS="example-org/sara-automation:release.yml"
```

Use comma-separated values for multiple exact entries. Every workflow entry must include the repository and workflow filename, in `owner/repo:workflow.yml` format. Repository and workflow names are compared case-insensitively. An empty allowlist disables dispatch.

## 2. Make the workflow dispatchable

The configured workflow must use `workflow_dispatch`, for example:

```yaml
name: Release
on:
  workflow_dispatch:
    inputs:
      environment:
        description: Target environment
        required: true
        type: choice
        options:
          - staging
          - production
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Release workflow started for the selected input."
```

Use the actual workflow filename, such as `release.yml`, in the allowlist and proposal. A repository allowlist entry alone is not enough: the workflow must also be allowlisted.

## 3. Approval and verification

The chat proposal must provide these details:

- `repo`: exact `owner/repo` value.
- `workflow`: allowlisted workflow filename.
- `ref`: branch or tag, such as `main`.
- `inputs`: optional workflow inputs as strings, numbers, or booleans.

The workflow is dispatched only when a user presses **Approve** on the proposal. Malformed requests, missing approval, disabled workflows, unconfigured credentials, and allowlist mismatches are rejected before dispatch.

After GitHub accepts the dispatch, Sara compares the repository's run list with a pre-dispatch snapshot and searches for a newly created run matching the allowlisted workflow and selected ref. If found, the run ID, URL, status, and conclusion are recorded in the response. A queued or in-progress run is reported as pending; Sara does not claim that the workflow completed until GitHub reports a successful completed run.

If GitHub accepted the dispatch but the new run cannot be verified, Sara tells the user to check the repository's Actions page before retrying. This avoids blindly repeating a potentially accepted dispatch.

## Security notes

- The GitHub token is read from server-side environment variables only; it is never accepted from the request body.
- Use a token with the narrowest possible repository scope and only the permissions required to read Actions runs and dispatch the allowlisted workflow.
- Keep both allowlists exact and small. Do not use broad wildcard matching.
- The approval button is an application-level confirmation, not an identity-authentication system. Deploy this endpoint behind your application's authentication/access controls before allowing untrusted users to reach a repository with write-capable credentials.
- CI tests mock the GitHub API. A real dispatch requires a configured server token, allowlisted repository/workflow, and a workflow that supports `workflow_dispatch`.
