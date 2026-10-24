/**
 * Fail-closed policy for action execution.
 *
 * No email, calendar, GitHub, deployment, or desktop-app provider is currently
 * wired into this server. Until a real handler is registered and verified,
 * requests must never be reported as successfully executed.
 */
export type ActionExecutionDecision =
  | {
      httpStatus: 400;
      response: {
        success: false;
        status: 'INVALID_REQUEST';
        error: string;
      };
    }
  | {
      httpStatus: 501;
      response: {
        success: false;
        status: 'NOT_IMPLEMENTED';
        actionId: string;
        error: string;
      };
    };

const invalidRequest = (error: string): ActionExecutionDecision => ({
  httpStatus: 400,
  response: {
    success: false,
    status: 'INVALID_REQUEST',
    error,
  },
});

export function decideActionExecutionRequest(request: unknown): ActionExecutionDecision {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return invalidRequest('Invalid action request. No action was performed.');
  }

  const body = request as Record<string, unknown>;
  const actionId = typeof body.actionId === 'string' ? body.actionId.trim() : '';
  const action = typeof body.action === 'string' ? body.action.trim() : '';

  if (!actionId || actionId.length > 200 || !action || action.length > 120) {
    return invalidRequest('A valid actionId and action are required. No action was performed.');
  }

  return {
    httpStatus: 501,
    response: {
      success: false,
      status: 'NOT_IMPLEMENTED',
      actionId,
      error: `“${action}” action-এর জন্য বাস্তব service integration যুক্ত নেই। কোনো কাজ সম্পন্ন করা হয়নি। আগে একটি verified integration যুক্ত করতে হবে।`,
    },
  };
}
