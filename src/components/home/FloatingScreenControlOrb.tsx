import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSara } from '../../context/SaraContext';
import { Sparkles, Globe, X, Move, Smartphone, Mic, Hand, ChevronRight, Zap } from 'lucide-react';
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
            return {
              x: Math.min(Math.max(10, parsed.x), window.innerWidth - 70),
              y: Math.min(Math.max(50, parsed.y), window.innerHeight - 130),
            };
          }
        }
      } catch (e) {}
      return {
        x: Math.max(16, window.innerWidth - 80),
        y: Math.max(80, window.innerHeight - 170),
      };
    }
    return { x: 280, y: 520 };
  });

  const positionRef = useRef(position);
  positionRef.current = position;

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialOrbX: number;
    initialOrbY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialOrbX: 0,
    initialOrbY: 0,
    hasMoved: false,
  });

  // Keep orb within window bounds on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const orbSize = 62;
        const maxX = Math.max(10, window.innerWidth - orbSize - 10);
        const maxY = Math.max(50, window.innerHeight - orbSize - 75);
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(40, prev.y), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hand Drag Move Handler
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - dragStartRef.current.startX;
    const dy = clientY - dragStartRef.current.startY;

    if (Math.hypot(dx, dy) > 6) {
      dragStartRef.current.hasMoved = true;
      setShowQuickMenu(false);
    }

    const orbSize = 62;
    const maxX = Math.max(10, window.innerWidth - orbSize - 10);
    const maxY = Math.max(40, window.innerHeight - orbSize - 70);

    const newX = Math.max(10, Math.min(maxX, dragStartRef.current.initialOrbX + dx));
    const newY = Math.max(30, Math.min(maxY, dragStartRef.current.initialOrbY + dy));

    setPosition({ x: newX, y: newY });
  }, []);

  // Hand Drag End Handler
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);

    // Save final position to localStorage
    try {
      localStorage.setItem('sara_screen_orb_pos', JSON.stringify(positionRef.current));
    } catch (e) {}

    // Tactile vibration feedback on release
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (e) {}
    }

    // If user clicked or tapped without dragging (< 6px movement), toggle quick action menu
    if (!dragStartRef.current.hasMoved) {
      setShowQuickMenu((prev) => !prev);
    }
  }, []);

  // Touch & Pointer Start Handler
  const startDrag = (clientX: number, clientY: number) => {
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialOrbX: positionRef.current.x,
      initialOrbY: positionRef.current.y,
      hasMoved: false,
    };
    setIsDragging(true);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch (e) {}
    }
  };

  // Window listeners active only during drag for smooth hand movement
  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      handleDragMove(e.clientX, e.clientY);
    };

    const onPointerUp = (e: PointerEvent) => {
      e.preventDefault();
      handleDragEnd();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      handleDragEnd();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerUp, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!screenControlEnabled) {
    return null;
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999,
          touchAction: 'none',
        }}
        className="select-none transition-shadow"
      >
        {/* Quick Overlay Action Menu when tapped */}
        {showQuickMenu && !isDragging && (
          <div className="absolute bottom-16 right-0 glass-card-pink border border-pink-500/40 p-3.5 rounded-3xl shadow-[0_0_35px_rgba(255,46,147,0.5)] text-xs text-slate-100 w-72 animate-in fade-in zoom-in-95 pointer-events-auto bg-[#0a071c]/95 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-pink-500/20">
              <div className="flex items-center gap-1.5 font-bold text-pink-300">
                <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
                <span>SARA ওভারলে অ্যাসিস্ট্যান্ট</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickMenu(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-300 mb-2.5">
              হাত দিয়ে টেনে স্ক্রিনের যেকোনো কোণে রাখতে পারবেন। নিচের অপশনগুলো থেকে অ্যাপস কন্ট্রোল করুন:
            </p>

            {/* Quick Actions List */}
            <div className="space-y-1.5">
              {/* Option 1: Direct In-App Controller */}
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  setShowAppController(true);
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-pink-900/50 via-purple-900/40 to-slate-900 border border-pink-500/30 hover:border-pink-400 text-left flex items-center justify-between group active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-105">
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
                className="w-full p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/40 text-left flex items-center justify-between group active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105">
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

            {/* Hand movement hint */}
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-pink-300 font-semibold">
              <span className="flex items-center gap-1">
                <Hand className="w-3 h-3 text-pink-400" />
                <span>হাত দিয়ে এদিক-ওদিক সরান</span>
              </span>
              <span className="text-slate-400">Overlay Active</span>
            </div>
          </div>
        )}

        {/* Floating Draggable Orb Body */}
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            startDrag(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            if (e.touches.length > 0) {
              startDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
            isDragging ? 'scale-115 shadow-[0_0_40px_rgba(255,46,147,0.95)]' : 'hover:scale-105 active:scale-95'
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
      </div>

      {/* Direct App Controller Modal */}
      <DirectAppControllerModal
        isOpen={showAppController}
        onClose={() => setShowAppController(false)}
        onOpenVoice={onOpenVoice}
      />
    </>
  );
};
