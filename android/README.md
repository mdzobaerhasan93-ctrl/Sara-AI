# SARA AI Android Integration

This directory contains the native Android infrastructure for SARA AI.

## Deep Automation & Accessibility
SARA requires the `AccessibilityService` to perform actions on your behalf inside other applications (e.g., "Post a comment on Instagram").

### Security & Privacy
1. **Manual Enablement**: You must manually enable SARA in Android Settings > Accessibility.
2. **Transparency**: SARA logs all actions in the audit trail.
3. **Least Privilege**: The Accessibility Service is only triggered when you provide an explicit command to interact with an application.

## Next Steps
- Implement `SaraAutomationService.kt` logic to traverse `AccessibilityNodeInfo`.
- Develop the Floating Orb overlay using `WindowManager`.
