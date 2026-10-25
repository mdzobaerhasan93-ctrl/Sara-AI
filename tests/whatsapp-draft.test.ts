import assert from 'node:assert/strict';
import { buildWhatsAppDraft } from '../src/services/WhatsAppDraftService.ts';

const quoted = buildWhatsAppDraft('WhatsApp মেসেজ পাঠাও "আগামীকাল দেখা হবে"');
assert.equal(quoted.needsMessageText, false);
assert.equal(quoted.messageText, 'আগামীকাল দেখা হবে');
assert.equal(quoted.recipientPhone, undefined);
assert.equal(quoted.webFallbackUrl, 'https://wa.me/?text=' + encodeURIComponent('আগামীকাল দেখা হবে'));

const withRecipient = buildWhatsAppDraft('WhatsApp message to +880 1712-345678: "Meeting starts at 5"');
assert.equal(withRecipient.needsMessageText, false);
assert.equal(withRecipient.messageText, 'Meeting starts at 5');
assert.equal(withRecipient.recipientPhone, '8801712345678');
assert.equal(
  withRecipient.webFallbackUrl,
  'https://wa.me/8801712345678?text=' + encodeURIComponent('Meeting starts at 5'),
);

const colonText = buildWhatsAppDraft('WhatsApp message: Please call me tomorrow.');
assert.equal(colonText.messageText, 'Please call me tomorrow.');
assert.ok(colonText.webFallbackUrl?.includes(encodeURIComponent('Please call me tomorrow.')));

const BengaliColonText = buildWhatsAppDraft('WhatsApp বার্তা: আমি পথে আছি');
assert.equal(BengaliColonText.messageText, 'আমি পথে আছি');

const noContent = buildWhatsAppDraft('WhatsApp মেসেজ পাঠাও');
assert.equal(noContent.needsMessageText, true);
assert.equal(noContent.messageText, '');
assert.equal(noContent.webFallbackUrl, undefined);

const longContent = buildWhatsAppDraft('WhatsApp message: ' + 'x'.repeat(800));
assert.equal(longContent.messageText.length, 500);
assert.ok(longContent.webFallbackUrl?.length);

console.log('WhatsApp draft text extraction, recipient normalization, and no-invented-message checks passed.');
