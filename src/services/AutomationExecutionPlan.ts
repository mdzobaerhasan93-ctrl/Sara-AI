export type LocalAutomationKind = 'hydration' | 'sleep' | 'affirmation' | 'greeting';

export type AutomationExecutionPlan =
  | {
      supported: true;
      kind: LocalAutomationKind;
      reply: string;
      executionNote: string;
    }
  | {
      supported: false;
      reason: string;
    };

const MAX_ACTION_LENGTH = 500;

const EXTERNAL_OR_UNSUPPORTED_PATTERNS = [
  /\b(?:weather|forecast|agenda|calendar|meeting|email|e-mail|whatsapp|facebook|github|deploy|deployment|post|comment|purchase|payment|delete|launch|sync|upload|api|send|call)\b/i,
  /আবহাওয়া|আবহাওয়া|এজেন্ডা|ক্যালেন্ডার|মিটিং|ইমেইল|হোয়াটসঅ্যাপ|হোয়াটসঅ্যাপ|ফেসবুক|পোস্ট|কমেন্ট|ডিপ্লয়|ডিপ্লয়|ডিলিট|পেমেন্ট|সিঙ্ক|আপলোড|কল কর/i,
];

function cleanDescription(value: string): string {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_ACTION_LENGTH);
}

/**
 * Maps only clearly local, user-visible reminder actions to real local behavior.
 * External/data-fetching/unknown automation requests are rejected until a
 * registered executor exists; an AI-generated response is not execution.
 */
export function planAutomationExecution(nameInput: string, actionInput: string): AutomationExecutionPlan {
  const name = cleanDescription(nameInput);
  const action = cleanDescription(actionInput);
  const descriptor = `${name} ${action}`.trim();

  if (!descriptor || !action) {
    return {
      supported: false,
      reason: 'অটোমেশনের action description দেওয়া নেই।',
    };
  }

  if (EXTERNAL_OR_UNSUPPORTED_PATTERNS.some((pattern) => pattern.test(descriptor))) {
    return {
      supported: false,
      reason: 'এই action-এ external service, live data, বা অন্য integration দরকার; বর্তমানে সেটি যুক্ত নেই।',
    };
  }

  if (/hydration|drink water|water prompt|পানি|জল পান|পানি খাও/i.test(descriptor)) {
    return {
      supported: true,
      kind: 'hydration',
      reply: 'বাবু, একটু পানি খেয়ে নাও ❤️ শরীর ভালো রাখতে পানি পান করার ছোট্ট বিরতিটা মনে রেখো।',
      executionNote: 'Displayed an in-app hydration reminder. No external service was called.',
    };
  }

  if (/sweet dreams|sleep|bedtime|ঘুমের আগে|শুভ রাত্রি|ঘুমাতে যাও/i.test(descriptor)) {
    return {
      supported: true,
      kind: 'sleep',
      reply: 'শুভ রাত্রি সোনা ❤️ আজকের মতো বিশ্রাম নাও, আর নিজের যত্ন নিও।',
      executionNote: 'Displayed an in-app bedtime reminder. No external service was called.',
    };
  }

  if (/affirmation|positive|motivation|ইতিবাচক|উৎসাহ|অনুপ্রেরণা/i.test(descriptor)) {
    return {
      supported: true,
      kind: 'affirmation',
      reply: 'আজকের কথা: ছোট ছোট পদক্ষেপও তোমাকে সামনে এগিয়ে নেয়। নিজের ওপর বিশ্বাস রেখো ❤️',
      executionNote: 'Displayed an in-app affirmation. No external service was called.',
    };
  }

  if (/greeting|good morning|শুভ সকাল|সকালের শুভেচ্ছা/i.test(descriptor)) {
    return {
      supported: true,
      kind: 'greeting',
      reply: 'শুভ সকাল বাবু ❤️ আজকের দিনটা সুন্দরভাবে শুরু হোক।',
      executionNote: 'Displayed an in-app greeting. No external service was called.',
    };
  }

  return {
    supported: false,
    reason: 'এই automation-এর জন্য কোনো verified local executor নেই; কোনো action চালানো হয়নি।',
  };
}
