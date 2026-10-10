import React from 'react';
import {
  Home,
  MessageSquare,
  Mic,
  User,
  FlaskConical,
  Dices,
  Brain,
  Zap,
  ShieldCheck,
  Activity,
  CircleDollarSign,
  Settings,
  Heart,
} from 'lucide-react';
import { TabType } from './BottomNavigation';
import { useSara } from '../../context/SaraContext';

interface DesktopSidebarProps {
  activeTab: TabType | 'memories' | 'automations' | 'permissions' | 'activity';
  onTabChange: (tab: any) => void;
  onOpenVoice: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenVoice,
}) => {
  const { coinBalance, userProfile, isPassActive } = useSara();

  const navItems = [
    { id: 'home', label: 'Home Dashboard', icon: Home },
    { id: 'chat', label: 'Chat with Sara', icon: MessageSquare },
    { id: 'voice', label: 'Live Voice Mode', icon: Mic, action: onOpenVoice },
    { id: 'avatar', label: 'Avatar Wardrobe', icon: User },
    { id: 'science', label: 'Science Lab (Skills)', icon: FlaskConical, badge: 'AI Lab' },
    { id: 'ludo', label: 'Play Ludo Game', icon: Dices, badge: 'Game' },
    { id: 'memories', label: 'Memory Bank', icon: Brain },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'permissions', label: 'Permission Center', icon: ShieldCheck },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
    { id: 'coins', label: 'Coins & Pass', icon: CircleDollarSign, badge: `${coinBalance} 🪙` },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-[#070617]/95 border-r border-pink-500/15 p-4 sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(255,46,147,0.5)]">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
            SARA AI
          </h1>
          <p className="text-[11px] text-pink-400/80 font-medium">Virtual Companion</p>
        </div>
      </div>

      {/* VIP Status Tag */}
      <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-500/25 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-pink-400 font-semibold">Companion Pass</p>
          <p className="text-xs font-medium text-slate-200">
            {isPassActive ? 'VIP Pass Active' : 'Free Tier'}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono">
          {coinBalance} 🪙
        </span>
      </div>

      {/* Nav List */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/10 text-pink-300 font-medium border border-pink-500/30 shadow-[0_0_12px_rgba(255,46,147,0.2)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-pink-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-pink-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Profile Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {userProfile.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{userProfile.name}</p>
            <p className="text-[10px] text-emerald-400 font-mono">● Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
