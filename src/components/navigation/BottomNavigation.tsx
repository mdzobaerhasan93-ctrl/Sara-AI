import React from 'react';
import { Home, User, Heart, CircleDollarSign, Settings } from 'lucide-react';
import { useSara } from '../../context/SaraContext';

export type TabType = 'home' | 'avatar' | 'voice' | 'coins' | 'settings' | 'chat';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenVoice: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenVoice,
}) => {
  const { isDailyRewardClaimed, assistantState } = useSara();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070617]/90 backdrop-blur-xl border-t border-pink-500/20 px-3 py-2 safe-pb md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'home' ? 'text-pink-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px]">Home</span>
          {activeTab === 'home' && <span className="w-1 h-1 rounded-full bg-pink-500" />}
        </button>

        {/* Avatar */}
        <button
          onClick={() => onTabChange('avatar')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'avatar' ? 'text-pink-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px]">Avatar</span>
          {activeTab === 'avatar' && <span className="w-1 h-1 rounded-full bg-pink-500" />}
        </button>

        {/* Central Heart Button (Voice / Talk with Sara) */}
        <div className="relative -top-5">
          <button
            onClick={onOpenVoice}
            aria-label="Talk to Sara"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1b082e] via-[#330c4f] to-[#120524] border-2 border-pink-500 shadow-[0_0_20px_rgba(255,46,147,0.6)] flex items-center justify-center text-pink-400 hover:scale-105 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full border border-pink-400/50 flex items-center justify-center bg-pink-500/10">
              <Heart
                className={`w-6 h-6 text-pink-400 fill-pink-500/40 transition-transform ${
                  assistantState === 'SPEAKING' || assistantState === 'LISTENING'
                    ? 'animate-heartbeat fill-pink-500'
                    : 'group-hover:scale-110'
                }`}
              />
            </div>
            {/* Pulsing ring when active */}
            <span className="absolute inset-0 rounded-full border border-pink-400 animate-ping opacity-25 pointer-events-none" />
          </button>
        </div>

        {/* Coins */}
        <button
          onClick={() => onTabChange('coins')}
          className={`flex flex-col items-center gap-1 relative transition-colors ${
            activeTab === 'coins' ? 'text-pink-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CircleDollarSign className="w-5 h-5" />
            {!isDailyRewardClaimed && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            )}
          </div>
          <span className="text-[11px]">Coins</span>
          {activeTab === 'coins' && <span className="w-1 h-1 rounded-full bg-pink-500" />}
        </button>

        {/* Settings */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'settings' ? 'text-pink-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px]">Settings</span>
          {activeTab === 'settings' && <span className="w-1 h-1 rounded-full bg-pink-500" />}
        </button>
      </div>
    </nav>
  );
};
