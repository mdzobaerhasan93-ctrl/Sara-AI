# Automation execution scope

Sara currently has a small local reminder executor, not a general-purpose automation runtime.

## Supported local actions

The automation runner can display and optionally speak a local reminder for recognized in-app actions:
- Hydration / water reminders
- Bedtime / sleep reminders
- Positive affirmations
- Simple greetings

For those actions, the activity log says that an in-app reminder was displayed and explicitly notes that no external service was called.

## Unsupported actions

Actions that require weather/agenda data, calendar access, email, WhatsApp, Facebook, GitHub, deployment, payments, deletion, remote APIs, or an unknown executor are not run. Sara logs the attempt as failed, explains that a verified executor or service integration is missing, and does not update `lastRun` as if the action succeeded.

An AI-generated sentence is not proof that an action occurred. Adding an integration in the future requires an executor that actually performs the specific side effect and verifies the result before the activity status becomes `SUCCESS`.
