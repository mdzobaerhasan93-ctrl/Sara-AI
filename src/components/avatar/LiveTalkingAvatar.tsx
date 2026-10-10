import React from 'react';
import { RealHuman3DAvatar } from './RealHuman3DAvatar';
import { getAvatarMeta } from './avatarAssets';
import { useSara } from '../../context/SaraContext';

interface LiveTalkingAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' | 'compact';
  className?: string;
  avatarId?: string;
  showStatusBadge?: boolean;
}

export const LiveTalkingAvatar: React.FC<LiveTalkingAvatarProps> = ({
  size = 'lg',
  className = '',
  avatarId,
  showStatusBadge = false,
}) => {
  const { activeAvatarId, isSpeaking, assistantState } = useSara();
  const selected = avatarId || activeAvatarId;
  const meta = getAvatarMeta(selected);

  // For very small thumbnails (like 48px avatar pills in navigation/headers), render optimized 3D portrait
  if (size === 'sm') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-pink-500 shadow-[0_0_15px_rgba(255,46,147,0.6)] bg-slate-900 group">
          <img
            src={meta.imageUrl}
            alt={meta.name}
            className={`w-full h-full object-cover transform transition-transform duration-300 ${
              isSpeaking ? 'scale-110' : 'scale-100 group-hover:scale-105'
            }`}
          />
          {isSpeaking && (
            <span className="absolute inset-0 bg-pink-500/20 animate-pulse pointer-events-none" />
          )}
        </div>
      </div>
    );
  }

  // Full 3D Real Human Animated Avatar with WebGL & Three.js
  return (
    <RealHuman3DAvatar
      size={size}
      className={className}
      avatarId={selected}
      showStatusBadge={showStatusBadge}
      interactive={true}
    />
  );
};
