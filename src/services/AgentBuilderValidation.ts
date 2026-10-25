const MAX_PREVIEW_HTML_LENGTH = 500_000;
const MAX_SUMMARY_LENGTH = 2_000;
const MAX_TITLE_LENGTH = 160;
const MAX_FILE_COUNT = 20;
const MAX_FILE_CONTENT_LENGTH = 100_000;

export type AgentBuilderProvider = 'gemini' | 'fallback';

export interface AgentBuilderFile {
  fileName: string;
  language: string;
  content: string;
}

export interface NormalizedAgentBuilderData {
  taskTitle: string;
  bengaliTitle: string;
  summary: string;
  livePreviewHtml: string;
  techStack: string[];
  modelsInvolved: string[];
  files: AgentBuilderFile[];
  provider: AgentBuilderProvider;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function boundedText(value: unknown, limit: number): string {
  return typeof value === 'string'
    ? Array.from(value).filter((character) => character.charCodeAt(0) >= 32 || character === '\n' || character === '\t').join('').slice(0, limit)
    : '';
}

function normalizeFiles(value: unknown): AgentBuilderFile[] {
  if (!Array.isArray(value)) return [];
  const files: AgentBuilderFile[] = [];
  for (const raw of value.slice(0, MAX_FILE_COUNT)) {
    if (!isRecord(raw)) continue;
    const fileName = boundedText(raw.fileName, 120).trim();
    const language = boundedText(raw.language, 40).trim();
    const content = boundedText(raw.content, MAX_FILE_CONTENT_LENGTH);
    if (!fileName || !language || !content) continue;
    files.push({ fileName, language, content });
  }
  return files;
}

/**
 * The app builder executes one Gemini generation request or a local fallback.
 * It does not compile, test, deploy, or orchestrate other named models.
 * Normalize the payload to only report a usable browser preview and truthful
 * provider metadata.
 */
export function normalizeAgentBuilderData(
  input: unknown,
  providerInput: unknown,
): NormalizedAgentBuilderData | null {
  if (!isRecord(input)) return null;
  const livePreviewHtml = typeof input.livePreviewHtml === 'string' ? input.livePreviewHtml.trim() : '';
  if (!livePreviewHtml || livePreviewHtml.length > MAX_PREVIEW_HTML_LENGTH) return null;

  const provider: AgentBuilderProvider = providerInput === 'fallback' ? 'fallback' : 'gemini';
  const includesTailwind = livePreviewHtml.includes('cdn.tailwindcss.com');
  const taskTitle = boundedText(input.taskTitle, MAX_TITLE_LENGTH).trim() || 'Browser prototype preview';
  const bengaliTitle = boundedText(input.bengaliTitle, MAX_TITLE_LENGTH).trim() || 'ব্রাউজার প্রোটোটাইপ প্রিভিউ';
  const suppliedSummary = boundedText(input.summary, MAX_SUMMARY_LENGTH).trim();
  const summary = provider === 'fallback'
    ? 'সার্ভার বিল্ট-ইন fallback template দেখাচ্ছে। এটি তোমার অনুরোধের পূর্ণ implementation নয়; build, test বা deployment করা হয়নি।'
    : (suppliedSummary
      ? `${suppliedSummary} (Browser preview only; build, tests and deployment have not been performed.)`
      : 'Gemini API থেকে একটি browser preview তৈরি হয়েছে। এটি production-ready, compiled, tested বা deployed বলে যাচাই করা হয়নি।');

  return {
    taskTitle,
    bengaliTitle,
    summary,
    livePreviewHtml,
    techStack: includesTailwind
      ? ['HTML5', 'Tailwind CSS (CDN)', 'Browser JavaScript']
      : ['HTML5', 'CSS', 'Browser JavaScript'],
    modelsInvolved: provider === 'fallback' ? ['Built-in fallback template'] : ['Gemini API'],
    files: normalizeFiles(input.files),
    provider,
  };
}
