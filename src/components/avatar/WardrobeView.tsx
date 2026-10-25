import React, { useState } from 'react';
import { useSara } from '../../context/SaraContext';
import { RealHuman3DAvatar } from './RealHuman3DAvatar';
import { Check, Sparkles, ShoppingBag, Shirt, Glasses, Lock, Flame } from 'lucide-react';

export { WARDROBE_ITEMS } from '../../services/WardrobeInventory';
import { WARDROBE_ITEMS, type WardrobeItem } from '../../services/WardrobeInventory';

export const WardrobeView: React.FC = () => {
  const {
    activeAvatarId,
    coinBalance,
    equippedOutfit,
    equippedAccessory,
    unlockedOutfits,
    unlockedAccessories,
    equipOutfit,
    equipAccessory,
    buyWardrobeItem,
  } = useSara();

  const [activeTab, setActiveTab] = useState<'outfits' | 'accessories'>('outfits');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleItemClick = (item: WardrobeItem) => {
    const isUnlocked =
      item.type === 'outfit'
        ? unlockedOutfits.includes(item.id)
        : unlockedAccessories.includes(item.id);

    if (isUnlocked) {
      if (item.type === 'outfit') {
        equipOutfit(item.id);
        showNotice(`Equipped outfit: ${item.name}`);
      } else {
        equipAccessory(item.id);
        showNotice(`Equipped accessory: ${item.name}`);
      }
    } else {
      if (coinBalance >= item.cost) {
        const success = buyWardrobeItem(item.id, item.type);
        if (success) {
          showNotice(`Successfully unlocked & equipped ${item.name}! 🎉`);
        }
      } else {
        showNotice(`Insufficient coins! You need ${item.cost} coins. Watch ads to earn more.`);
      }
    }
  };

  const filteredItems = WARDROBE_ITEMS.filter((i) =>
    activeTab === 'outfits' ? i.type === 'outfit' : i.type === 'accessory'
  );

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300">
      {/* Top Banner / Live 3D Avatar Preview with Wardrobe */}
      <div className="relative rounded-3xl glass-card-pink border border-pink-500/30 p-5 flex flex-col items-center justify-center overflow-hidden min-h-[360px] shadow-[0_0_30px_rgba(255,46,147,0.25)]">
        <div className="absolute inset-0 bg-radial from-pink-950/40 via-purple-950/20 to-transparent pointer-events-none" />

        {/* Live 3D Avatar Stage */}
        <div className="relative z-10 w-full flex justify-center">
          <RealHuman3DAvatar
            size="lg"
            avatarId={activeAvatarId}
            showStatusBadge
            className="transform hover:scale-105 transition-transform"
          />
        </div>

        {/* Status Notice */}
        {notification && (
          <div className="absolute top-3 z-20 bg-pink-600/90 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-pink-400 animate-bounce">
            {notification}
          </div>
        )}

        <div className="relative z-10 mt-3 flex items-center gap-3 bg-black/50 px-4 py-1.5 rounded-full border border-pink-500/30 text-xs text-pink-300">
          <span>✨ Wardrobe Active</span>
          <span>•</span>
          <span className="text-amber-300 font-bold flex items-center gap-1">
            <span>🪙</span> {coinBalance} Coins
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-card border border-pink-500/20">
        <button
          onClick={() => setActiveTab('outfits')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'outfits'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(255,46,147,0.4)]'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>Outfits & Dresses</span>
        </button>
        <button
          onClick={() => setActiveTab('accessories')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'accessories'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(255,46,147,0.4)]'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          <Glasses className="w-4 h-4" />
          <span>Accessories & Jewelry</span>
        </button>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredItems.map((item) => {
          const isUnlocked =
            item.type === 'outfit'
              ? unlockedOutfits.includes(item.id)
              : unlockedAccessories.includes(item.id);

          const isEquipped =
            item.type === 'outfit'
              ? equippedOutfit === item.id
              : equippedAccessory === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`relative rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center text-center border ${
                isEquipped
                  ? 'bg-gradient-to-b from-pink-950/70 to-purple-950/60 border-2 border-pink-500 shadow-[0_0_20px_rgba(255,46,147,0.5)] scale-102'
                  : isUnlocked
                  ? 'bg-slate-900/80 border-slate-800 hover:border-pink-500/50'
                  : 'bg-slate-950/90 border-slate-900 hover:border-amber-500/40'
              }`}
            >
              {/* Equipped / Unlocked badge */}
              {isEquipped && (
                <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs shadow">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
              {!isUnlocked && (
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-500/30">
                  <Lock className="w-2.5 h-2.5" />
                  <span>{item.cost}c</span>
                </span>
              )}

              {/* Icon / Emoji thumbnail */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-inner"
                style={{ backgroundColor: `${item.color}25`, border: `1px solid ${item.color}50` }}
              >
                <span>{item.icon}</span>
              </div>

              <p className="text-xs font-bold text-slate-100">{item.name}</p>
              <p className="text-[10px] text-pink-400/90 font-medium mt-0.5">{item.bengaliName}</p>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{item.description}</p>

              <button
                className={`mt-3 w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isEquipped
                    ? 'bg-pink-600 text-white shadow'
                    : isUnlocked
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    : coinBalance >= item.cost
                    ? 'bg-gradient-to-r from-amber-500 to-pink-600 text-white shadow'
                    : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isEquipped ? 'Equipped' : isUnlocked ? 'Equip' : `Unlock (${item.cost}c)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
