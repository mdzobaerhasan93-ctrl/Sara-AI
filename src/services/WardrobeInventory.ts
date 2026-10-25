export type WardrobeItemType = 'outfit' | 'accessory';

export interface WardrobeItem {
  id: string;
  name: string;
  bengaliName: string;
  type: WardrobeItemType;
  cost: number;
  color: string;
  description: string;
  icon: string;
}

export const WARDROBE_ITEMS: WardrobeItem[] = [
  {
    id: 'cyber_jacket',
    name: 'Cyber Neon Jacket',
    bengaliName: 'সাইবার নিয়ন জ্যাকেট',
    type: 'outfit',
    cost: 0,
    color: '#ec4899',
    description: 'Sleek cyber jacket with glowing pink neon trim.',
    icon: '🧥',
  },
  {
    id: 'silk_saree',
    name: 'Traditional Red Silk Saree',
    bengaliName: 'লাল বেনারসি শাড়ি',
    type: 'outfit',
    cost: 150,
    color: '#dc2626',
    description: 'Exquisite red Banarasi silk saree with gold embroidery.',
    icon: '🥻',
  },
  {
    id: 'royal_gown',
    name: 'Royal Velvet Gown',
    bengaliName: 'রয়েল ভেলভেট গাউন',
    type: 'outfit',
    cost: 300,
    color: '#7c3aed',
    description: 'Majestic deep purple velvet gown fit for royalty.',
    icon: '👗',
  },
  {
    id: 'casual_hoodie',
    name: 'Cozy Pink Hoodie',
    bengaliName: 'গোলাপি হুডি',
    type: 'outfit',
    cost: 50,
    color: '#f43f5e',
    description: 'Comfortable oversized soft pink hoodie.',
    icon: '👕',
  },
  {
    id: 'none',
    name: 'No Accessory',
    bengaliName: 'কোনোটি না',
    type: 'accessory',
    cost: 0,
    color: '#64748b',
    description: 'Natural pristine look without extra accessories.',
    icon: '✨',
  },
  {
    id: 'crown',
    name: 'Royal Diamond Crown',
    bengaliName: 'হীরার মুকুট',
    type: 'accessory',
    cost: 500,
    color: '#fbbf24',
    description: 'Sparkling diamond tiara for radiant majesty.',
    icon: '👑',
  },
  {
    id: 'visor',
    name: 'Cyber AR Visor',
    bengaliName: 'সাইবার ভিজর',
    type: 'accessory',
    cost: 200,
    color: '#06b6d4',
    description: 'Futuristic holographic HUD visor with live telemetry.',
    icon: '🕶️',
  },
  {
    id: 'necklace',
    name: 'Heart Gold Necklace',
    bengaliName: 'সোনার হার ও লকেট',
    type: 'accessory',
    cost: 100,
    color: '#f59e0b',
    description: 'Golden chain with glowing ruby heart pendant.',
    icon: '📿',
  },
  {
    id: 'garland',
    name: 'Bengali Floral Mala',
    bengaliName: 'সুবাসিত ফুলের মালা',
    type: 'accessory',
    cost: 75,
    color: '#ffffff',
    description: 'Fragrant white rajnigandha and marigold garland.',
    icon: '🌸',
  },
];

export type WardrobePurchaseDecision =
  | { allowed: true; item: WardrobeItem; cost: number }
  | { allowed: false; reason: 'INVALID_ITEM' | 'INVALID_BALANCE' | 'ALREADY_UNLOCKED' | 'INSUFFICIENT_FUNDS' };

export function getWardrobeItem(id: unknown, type: unknown): WardrobeItem | null {
  if (typeof id !== 'string' || typeof type !== 'string') return null;
  return WARDROBE_ITEMS.find((item) => item.id === id && item.type === type) || null;
}

/**
 * Resolves purchase prices only from the shared inventory catalog. The caller
 * cannot provide or override the price. This is client-side protection; any
 * real-value economy still needs a server-authoritative ledger.
 */
export function decideWardrobePurchase(
  id: unknown,
  type: unknown,
  coinBalance: unknown,
  unlockedIds: unknown,
): WardrobePurchaseDecision {
  const item = getWardrobeItem(id, type);
  if (!item) return { allowed: false, reason: 'INVALID_ITEM' };

  if (typeof coinBalance !== 'number' || !Number.isSafeInteger(coinBalance) || coinBalance < 0) {
    return { allowed: false, reason: 'INVALID_BALANCE' };
  }

  if (!Array.isArray(unlockedIds) || unlockedIds.some((entry) => typeof entry !== 'string')) {
    return { allowed: false, reason: 'INVALID_ITEM' };
  }

  if (unlockedIds.includes(item.id)) {
    return { allowed: false, reason: 'ALREADY_UNLOCKED' };
  }

  if (coinBalance < item.cost) {
    return { allowed: false, reason: 'INSUFFICIENT_FUNDS' };
  }

  return { allowed: true, item, cost: item.cost };
}
