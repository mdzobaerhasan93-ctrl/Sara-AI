import React, { useState, useEffect, useRef } from 'react';
import { useSara } from '../../context/SaraContext';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import {
  Sparkles,
  Globe,
  X,
  Move,
  Smartphone,
  Mic,
  Hand,
  ChevronRight,
  Plus,
  MapPin,
  Layers
} from 'lucide-react';
import { DirectAppControllerModal } from './DirectAppControllerModal';

interface FloatingScreenControlOrbProps {
  onOpenVoice: () => void;
}

export const FloatingScreenControlOrb: React.FC<FloatingScreenControlOrbProps> = ({ onOpenVoice }) => {
  const { screenControlEnabled, speakText } = useSara();
  const [showQuickMenu, setShowQuickMenu] = useState<boolean>(false);
  const [showAppController, setShowAppController] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Position state (persisted in localStorage)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sara_screen_orb_pos');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            const maxX = Math.max(10, window.innerWidth - 75);
            const maxY = Math.max(50, window.innerHeight - 80);
            return {
              x: Math.min(Math.max(10, parsed.x), maxX),
              y: Math.min(Math.max(40, parsed.y), maxY),
            };
          }
        }
      } catch (e) {}
      return {
        x: Math.max(16, (typeof window !== 'undefined' ? window.innerWidth : 360) - 80),
        y: Math.max(80, (typeof window !== 'undefined' ? window.innerHeight : 640) - 170),
      };
    }
    return { x: 280, y: 520 };
  });

  // Framer Motion motion values for hardware-accelerated 60fps drag
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  // Keep motion values in sync with state
  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);

  const hasMovedRef = useRef<boolean>(false);

  // Keep orb inside viewport bounds on screen resize
  useEffect(() => {
    const handleResize = () => {
      const orbSize = 64;
      const maxX = Math.max(10, window.innerWidth - orbSize - 10);
      const maxY = Math.max(40, window.innerHeight - orbSize - 70);

      setPosition((prev) => {
        const clampedX = Math.min(Math.max(10, prev.x), maxX);
        const clampedY = Math.min(Math.max(40, prev.y), maxY);
        x.set(clampedX);
        y.set(clampedY);
        return { x: clampedX, y: clampedY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x, y]);

  if (!screenControlEnabled) {
    return null;
  }

  const isNearBottom = position.y > (typeof window !== 'undefined' ? window.innerHeight / 2 : 400);
  const isNearRight = position.x > (typeof window !== 'undefined' ? window.innerWidth / 2 : 200);

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.08}
        dragConstraints={{
          left: 10,
          top: 35,
          right: typeof window !== 'undefined' ? Math.max(10, window.innerWidth - 75) : 340,
          bottom: typeof window !== 'undefined' ? Math.max(40, window.innerHeight - 80) : 600,
        }}
        style={{
          x,
          y,
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 9999,
          touchAction: 'none',
        }}
        onDragStart={() => {
          setIsDragging(true);
          hasMovedRef.current = false;
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(10);
            } catch (e) {}
          }
        }}
        onDrag={(_event, info: PanInfo) => {
          if (Math.hypot(info.offset.x, info.offset.y) > 6) {
            hasMovedRef.current = true;
            setShowQuickMenu(false);
          }
        }}
        onDragEnd={(_event, _info: PanInfo) => {
          setIsDragging(false);

          const orbSize = 64;
          const maxX = Math.max(10, window.innerWidth - orbSize - 10);
          const maxY = Math.max(40, window.innerHeight - orbSize - 70);

          const currentX = x.get();
          const currentY = y.get();

          const clampedX = Math.round(Math.min(maxX, Math.max(10, currentX)));
          const clampedY = Math.round(Math.min(maxY, Math.max(30, currentY)));

          x.set(clampedX);
          y.set(clampedY);
          setPosition({ x: clampedX, y: clampedY });

          try {
            localStorage.setItem('sara_screen_orb_pos', JSON.stringify({ x: clampedX, y: clampedY }));
          } catch (e) {}

          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(12);
            } catch (e) {}
          }

          // If the user tapped or clicked without dragging, toggle quick menu
          if (!hasMovedRef.current) {
            setShowQuickMenu((prev) => !prev);
          }
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="select-none"
      >
        {/* Quick Overlay Action Menu */}
        {showQuickMenu && !isDragging && (
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className={`absolute ${isNearBottom ? 'bottom-18' : 'top-18'} ${
              isNearRight ? 'right-0' : 'left-0'
            } glass-card-pink border border-pink-500/40 p-4 rounded-3xl shadow-[0_0_40px_rgba(255,46,147,0.55)] text-xs text-slate-100 w-76 animate-in fade-in zoom-in-95 pointer-events-auto bg-[#09061c]/95 backdrop-blur-xl z-50`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-pink-500/20">
              <div className="flex items-center gap-1.5 font-bold text-pink-300">
                <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
                <span>SARA ওভারলে অ্যাসিস্ট্যান্ট</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickMenu(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
              হাত দিয়ে টেনে স্ক্রিনের যেকোনো জায়গায় সরান। নিচের অপশনগুলো থেকে অ্যাপস কন্ট্রোল করুন:
            </p>

            {/* Quick Actions List */}
            <div className="space-y-2">
              {/* Option 1: Direct In-App Controller */}
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  setShowAppController(true);
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-pink-900/60 via-purple-900/50 to-slate-900 border border-pink-500/35 hover:border-pink-400 text-left flex items-center justify-between group active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/25 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(255,46,147,0.4)]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100 group-hover:text-pink-300">
                      অ্যাপস কন্ট্রোল সেন্টার
                    </p>
                    <p className="text-[10px] text-slate-400">রিলস কমেন্ট, স্ট্যাটাস, ভিডিও, চ্যাট</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-pink-400" />
              </button>

              {/* Option 2: Talk with Sara Voice */}
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onOpenVoice();
                }}
                className="w-full p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-left flex items-center justify-between group active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                      সারা'র সাথে ভয়েসে কথা বলুন
                    </p>
                    <p className="text-[10px] text-slate-400">লাইভ বাংলা ভয়েস অ্যাসিস্ট্যান্ট</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Hand movement hint & live coordinate status */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-pink-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Hand className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span>হাত দিয়ে টানুন</span>
              </span>
              <span className="text-[9.5px] font-mono text-cyan-400/90 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/20">
                X:{position.x} Y:{position.y}
              </span>
            </div>
          </div>
        )}

        {/* Floating Draggable Orb Body */}
        <div
          className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
            isDragging
              ? 'scale-115 shadow-[0_0_45px_rgba(255,46,147,0.95)]'
              : 'hover:scale-105 active:scale-95'
          }`}
          title="হাত দিয়ে টেনে স্ক্রিনের যেকোনো জায়গায় রাখুন (ট্যাপ করলে কন্ট্রোলার খুলবে)"
        >
          {/* Outer glowing pulsing ring */}
          <div
            className={`absolute -inset-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 blur-sm transition-opacity ${
              isDragging ? 'opacity-100 animate-none scale-110' : 'opacity-75 animate-pulse'
            }`}
          />

          {/* Circular Orb Body */}
          <div className="relative w-15 h-15 rounded-full bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 border-2 border-pink-400 flex items-center justify-center shadow-[0_0_25px_rgba(255,46,147,0.7)] overflow-hidden">
            {/* Animated decorative orbit rings */}
            <div className="absolute inset-0 rounded-full border border-pink-400/40 animate-[spin_8s_linear_infinite]" />
            <div className="absolute inset-1 rounded-full border border-cyan-400/30 animate-[spin_5s_linear_infinite_reverse]" />

            {/* Center Core Live Icon */}
            <div className="relative z-10 flex flex-col items-center justify-center text-pink-300 pointer-events-none">
              <Globe className="w-6 h-6 animate-pulse text-pink-300" />
              <span className="text-[7.5px] font-black tracking-tighter bg-gradient-to-r from-pink-600 to-purple-600 text-white px-1.5 py-0.2 rounded-full shadow-sm mt-0.5">
                SARA
              </span>
            </div>

            {/* Drag indicator grip icon */}
            <div className="absolute top-1 right-1 opacity-70 pointer-events-none">
              <Move className="w-2.5 h-2.5 text-pink-300" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Direct App Controller Modal */}
      <DirectAppControllerModal
        isOpen={showAppController}
        onClose={() => setShowAppController(false)}
        onOpenVoice={onOpenVoice}
      />
    </>
  );
};
