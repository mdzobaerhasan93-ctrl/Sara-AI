export interface DirectAppActionRequest {
  packageName: string;
  actionId: string;
  payload: string;
}

export type DirectAppDispatchResult =
  | {
      status: 'FAILED';
      message: string;
      errorCode: 'BRIDGE_UNAVAILABLE' | 'DISPATCH_FAILED';
    }
  | {
      status: 'PENDING';
      message: string;
      errorCode: 'COMPLETION_UNVERIFIED';
    }
  | {
      status: 'SUCCESS';
      message: string;
      verified: true;
    };

interface AndroidActionBridge {
  performAccessibilityAction: (
    packageName: string,
    actionId: string,
    payload: string,
  ) => unknown | Promise<unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isAndroidActionBridge(value: unknown): value is AndroidActionBridge {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
    && typeof (value as { performAccessibilityAction?: unknown }).performAccessibilityAction === 'function';
}

/**
 * Dispatches an action only through an installed native bridge.
 * A returned Promise or a lack of thrown errors does not prove that the device
 * action completed. Success requires an explicit { success: true, completed: true }
 * acknowledgement from the native bridge.
 */
/**
 * Extracts message/comment/caption text only when the user explicitly supplied
 * it. The screen-control parser does not synthesize a default payload.
 */
export function extractExplicitActionPayload(command: unknown): string | null {
  if (typeof command !== 'string' || command.length > 8_000) return null;

  const quotedPatterns = [
    /"([^"\r\n]{1,500})"/,
    /“([^”\r\n]{1,500})”/,
    /'([^'\r\n]{1,500})'/,
    /‘([^’\r\n]{1,500})’/,
    /「([^」\r\n]{1,500})」/,
  ];

  for (const pattern of quotedPatterns) {
    const match = command.match(pattern);
    if (match?.[1]) {
      const content = sanitizeExplicitPayload(match[1]);
      if (content) return content;
    }
  }

  const labeledPatterns = [
    /(?:message|text|comment|caption|status|বার্তা|মেসেজ|কমেন্ট|ক্যাপশন|স্ট্যাটাস)\s*[:：]\s*(.{1,500})$/i,
    /(?:লিখে\s*দাও|লিখুন|বলবে)\s+(.{1,500})$/i,
  ];

  for (const pattern of labeledPatterns) {
    const match = command.match(pattern);
    if (match?.[1]) {
      const content = sanitizeExplicitPayload(match[1]);
      if (content) return content;
    }
  }

  return null;
}

function sanitizeExplicitPayload(value: string): string | null {
  const text = Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .trim()
    .slice(0, 500);
  return text || null;
}

export async function dispatchDirectAppAction(
  bridgeInput: unknown,
  request: DirectAppActionRequest,
): Promise<DirectAppDispatchResult> {
  if (!isAndroidActionBridge(bridgeInput)) {
    return {
      status: 'FAILED',
      errorCode: 'BRIDGE_UNAVAILABLE',
      message: 'Native Android accessibility bridge is not available in this environment. No action was executed.',
    };
  }

  try {
    const result: unknown = await bridgeInput.performAccessibilityAction(
      request.packageName,
      request.actionId,
      request.payload,
    );

    if (isRecord(result) && result.success === true && result.completed === true) {
      return {
        status: 'SUCCESS',
        verified: true,
        message: 'The native bridge explicitly confirmed that the action completed.',
      };
    }

    return {
      status: 'PENDING',
      errorCode: 'COMPLETION_UNVERIFIED',
      message: 'The action was handed to the native bridge, but completion was not verified. Check the target app before treating it as done.',
    };
  } catch {
    return {
      status: 'FAILED',
      errorCode: 'DISPATCH_FAILED',
      message: 'The native bridge failed to accept the action. No successful completion was confirmed.',
    };
  }
}
