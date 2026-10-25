export const DEFAULT_UNLOCKED_OUTFITS = ['cyber_jacket', 'casual_hoodie'] as const;
export const DEFAULT_UNLOCKED_ACCESSORIES = ['none', 'necklace'] as const;

const OUTFIT_IDS = new Set(['cyber_jacket', 'silk_saree', 'royal_gown', 'casual_hoodie']);
const ACCESSORY_IDS = new Set(['none', 'crown', 'visor', 'necklace', 'garland']);
const MAX_SAVED_IDS = 20;

function parseStoredArray(value: string | null): unknown[] | null {
  if (value === null) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeUnlocked(
  rawValue: string | null,
  allowedIds: Set<string>,
  defaults: readonly string[],
  starterId: string,
): string[] {
  const parsed = parseStoredArray(rawValue);
  if (!parsed) return [...defaults];

  const unique = new Set<string>();
  for (const candidate of parsed.slice(0, MAX_SAVED_IDS)) {
    if (typeof candidate !== 'string') continue;
    const id = candidate.trim().toLowerCase();
    if (!allowedIds.has(id)) continue;
    unique.add(id);
  }

  // Keep the free starter item available even if persisted storage is empty or
  // has been edited to remove the free item.
  unique.add(starterId);
  return [...unique];
}

export function validateStoredUnlockedOutfits(value: string | null): string[] {
  return normalizeUnlocked(value, OUTFIT_IDS, DEFAULT_UNLOCKED_OUTFITS, 'cyber_jacket');
}

export function validateStoredUnlockedAccessories(value: string | null): string[] {
  return normalizeUnlocked(value, ACCESSORY_IDS, DEFAULT_UNLOCKED_ACCESSORIES, 'none');
}

export function validateStoredEquippedOutfit(value: string | null, unlockedOutfits: string[]): string {
  const id = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (OUTFIT_IDS.has(id) && unlockedOutfits.includes(id)) return id;
  return unlockedOutfits.find((candidate) => OUTFIT_IDS.has(candidate)) || 'cyber_jacket';
}

export function validateStoredEquippedAccessory(value: string | null, unlockedAccessories: string[]): string {
  const id = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (ACCESSORY_IDS.has(id) && unlockedAccessories.includes(id)) return id;
  return unlockedAccessories.find((candidate) => ACCESSORY_IDS.has(candidate)) || 'none';
}
