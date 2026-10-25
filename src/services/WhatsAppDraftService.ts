export interface WhatsAppDraft {
  messageText: string;
  recipientPhone?: string;
  webFallbackUrl?: string;
  needsMessageText: boolean;
}

const MAX_MESSAGE_LENGTH = 500;

function sanitizeText(value: string): string {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

function extractMessageText(command: string): string {
  const quotedPatterns = [
    /"([^"\n]{1,500})"/,
    /“([^”\n]{1,500})”/,
    /'([^'\n]{1,500})'/,
    /‘([^’\n]{1,500})’/,
    /「([^」\n]{1,500})」/,
  ];

  for (const pattern of quotedPatterns) {
    const match = command.match(pattern);
    if (match?.[1]) return sanitizeText(match[1]);
  }

  const labeledPatterns = [
    /(?:message|text|this|মেসেজ|বার্তা|লিখে\s*দাও|লিখুন)\s*[:：]\s*(.{1,500})$/i,
    /(?:saying|বলবে|লিখে\s*পাঠাও|লিখে\s*দাও)\s+(.{1,500})$/i,
  ];

  for (const pattern of labeledPatterns) {
    const match = command.match(pattern);
    if (match?.[1]) return sanitizeText(match[1]);
  }

  return '';
}

function extractRecipientPhone(command: string): string | undefined {
  const match = command.match(
    /(?:\bto\b|\bnumber\b|\bphone(?:\s+number)?\b|নম্বরে|নাম্বারে|ফোন(?:\s*নম্বর)?)\s*[:=]?\s*(\+?\d[\d\s().-]{5,}\d)/i,
  );
  if (!match?.[1]) return undefined;

  const digits = match[1].replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 ? digits : undefined;
}

/**
 * Creates a WhatsApp click-to-chat draft from explicit user-provided content.
 * It never sends the message and never invents message text when the command
 * does not include any.
 */
export function buildWhatsAppDraft(command: string): WhatsAppDraft {
  const messageText = extractMessageText(command);
  if (!messageText) {
    return {
      messageText: '',
      needsMessageText: true,
    };
  }

  const recipientPhone = extractRecipientPhone(command);
  const encodedMessage = encodeURIComponent(messageText);
  const webFallbackUrl = recipientPhone
    ? `https://wa.me/${recipientPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  return {
    messageText,
    ...(recipientPhone ? { recipientPhone } : {}),
    webFallbackUrl,
    needsMessageText: false,
  };
}
