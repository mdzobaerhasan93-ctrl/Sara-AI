export interface HighThinkingRequest {
  prompt: string;
  systemInstruction?: string;
}

export type HighThinkingValidation =
  | { success: true; data: HighThinkingRequest }
  | { success: false; error: string };

const MAX_PROMPT_LENGTH = 12_000;
const MAX_SYSTEM_INSTRUCTION_LENGTH = 4_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeText(value: string): string {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .replace(/\r\n?/g, '\n')
    .trim();
}

/**
 * Validates the public high-thinking request before the body is passed to the
 * provider. The endpoint accepts only text fields; caller-supplied model names,
 * generation config objects, and arbitrary contents objects are not forwarded.
 */
export function validateHighThinkingRequest(input: unknown): HighThinkingValidation {
  if (!isRecord(input)) {
    return { success: false, error: 'Request body must be an object.' };
  }

  if (typeof input.prompt !== 'string') {
    return { success: false, error: 'Prompt must be a text string.' };
  }

  const prompt = normalizeText(input.prompt);
  if (!prompt) {
    return { success: false, error: 'Prompt is required.' };
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { success: false, error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.` };
  }

  let systemInstruction: string | undefined;
  if (input.systemInstruction !== undefined && input.systemInstruction !== null) {
    if (typeof input.systemInstruction !== 'string') {
      return { success: false, error: 'System instruction must be a text string.' };
    }

    systemInstruction = normalizeText(input.systemInstruction);
    if (systemInstruction.length > MAX_SYSTEM_INSTRUCTION_LENGTH) {
      return {
        success: false,
        error: `System instruction must be ${MAX_SYSTEM_INSTRUCTION_LENGTH} characters or fewer.`,
      };
    }
    if (!systemInstruction) systemInstruction = undefined;
  }

  return {
    success: true,
    data: {
      prompt,
      ...(systemInstruction ? { systemInstruction } : {}),
    },
  };
}
