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
