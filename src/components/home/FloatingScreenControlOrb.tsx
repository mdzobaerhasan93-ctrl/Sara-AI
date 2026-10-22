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
  ChevronRight,
  Tv,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Info,
  Film,
  MessageSquare
} from 'lucide-react';
import { DirectAppControllerModal } from './DirectAppControllerModal';
import { SystemFloatingOverlayService } from '../../services/SystemFloatingOverlayService';

interface FloatingScreenControlOrbProps {
  onOpenVoice: () => void;
}

export const FloatingScreenControlOrb: React.FC<FloatingScreenControlOrbProps> = ({ onOpenVoice }) => {
  const { screenControlEnabled, speakText } = useSara();
  const [showQuickMenu, setShowQuickMenu] = useState<boolean>(false);
  const [showAppController, setShowAppController] = useState<boolean>(false);
  const [showOverlayGuide, setShowOverlayGuide] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSystemFloatingActive, setIsSystemFloatingActive] = useState<boolean>(false);

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
        x: Math.max(16, (typeof window !== 'undefined' ? window.innerWidth : 360) - 76),
        y: Math.max(80, (typeof window !== 'undefined' ? window.innerHeight : 640) - 170),
      };
    }
    return { x: 280, y: 500 };
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

  // Handle Float Over Other Apps (Picture-in-Picture System Overlay)
  const handleToggleSystemOverlay = async () => {
    if (isSystemFloatingActive) {
      SystemFloatingOverlayService.stopFloatingOverlay();
      setIsSystemFloatingActive(false);
      speakText('সিস্টেম ভাসমান মোড বন্ধ করা হয়েছে বাবু।', 'caring');
    } else {
      const launched = await SystemFloatingOverlayService.startFloatingOverlay({
        onVoiceClick: () => {
          onOpenVoice();
        },
        onAppsClick: () => {
          setShowAppController(true);
        },
        onClose: () => {
          setIsSystemFloatingActive(false);
        },
      });

      if (launched) {
        setIsSystemFloatingActive(true);
        speakText('সোনা! সারা এখন অন্য সব অ্যাপের উপরে ভাসমান স্ক্রিনে সাথে আছে ❤️', 'romantic');
      } else {
        setShowOverlayGuide(true);
      }
    }
    setShowQuickMenu(false);
  };

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
          left: 8,
          top: 35,
          right: typeof window !== 'undefined' ? Math.max(10, window.innerWidth - 72) : 340,
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
        onDragEnd={(_event, info: PanInfo) => {
          setIsDragging(false);
          const finalX = x.get();
          const finalY = y.get();
          const maxX = Math.max(10, window.innerWidth - 72);
          const maxY = Math.max(40, window.innerHeight - 80);
          const clampedX = Math.min(Math.max(10, finalX), maxX);
          const clampedY = Math.min(Math.max(40, finalY), maxY);

          setPosition({ x: clampedX, y: clampedY });
          x.set(clampedX);
          y.set(clampedY);

          try {
            localStorage.setItem('sara_screen_orb_pos', JSON.stringify({ x: clampedX, y: clampedY }));
          } catch (e) {}

          if (!hasMovedRef.current && Math.hypot(info.offset.x, info.offset.y) <= 6) {
            setShowQuickMenu((prev) => !prev);
          }
        }}
        className="select-none"
      >
        {/* Floating Quick Action Drawer Menu */}
        {showQuickMenu && (
          <div
            className={`absolute z-50 w-72 max-w-[85vw] rounded-3xl bg-slate-950/95 border border-pink-500/40 p-4 shadow-[0_0_40px_rgba(255,46,147,0.35)] backdrop-blur-2xl transition-all duration-200 animate-in fade-in zoom-in-95 ${
              isNearBottom ? 'bottom-full mb-3' : 'top-full mt-3'
            } ${isNearRight ? 'right-0' : 'left-0'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">সারা ভাসমান সহকারী</h4>
                  <p className="text-[9px] text-pink-400 font-medium">Screen Floating Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickMenu(false)}
                className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Menu Options */}
            <div className="space-y-2">
              {/* Option 1: Float Over Other Apps (Always-On-Top PiP) */}
              <button
                onClick={handleToggleSystemOverlay}
                className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between group active:scale-98 transition-all ${
                  isSystemFloatingActive
                    ? 'bg-gradient-to-r from-emerald-950/80 via-teal-900/50 to-slate-900 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-gradient-to-r from-cyan-900/60 via-purple-900/50 to-slate-900 border-cyan-500/40 hover:border-cyan-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSystemFloatingActive
                        ? 'bg-emerald-500/30 text-emerald-300'
                        : 'bg-cyan-500/25 text-cyan-400 group-hover:scale-105'
                    } transition-transform shadow-[0_0_12px_rgba(6,182,212,0.4)]`}
                  >
                    <Tv className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 flex items-center gap-1.5">
                      <span>অন্য অ্যাপের ওপর ভাসিয়ে রাখুন</span>
                      {isSystemFloatingActive && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-mono">
                          ON
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">ইউটিউব, ফেসবুক ও হোমস্ক্রিনের উপর ভাসমান</p>
                  </div>
                </div>
                {isSystemFloatingActive ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                )}
              </button>

              {/* Option 2: AI Agent Hub (YouTube Movie, Facebook Comment) */}
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  setShowAppController(true);
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-purple-900/60 via-pink-900/50 to-slate-900 border border-purple-500/40 hover:border-purple-400 text-left flex items-center justify-between group active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100 group-hover:text-purple-300">
                      এআই এজেন্ট মুভি ও অ্যাপ কন্ট্রোলার
                    </p>
                    <p className="text-[10px] text-slate-400">ইউটিউব মুভি সার্চ, ফেসবুক অটো-কমেন্ট</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </button>

              {/* Option 3: Phone App Controller */}
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
                      ফোন অ্যাপস কন্ট্রোল সেন্টার
                    </p>
                    <p className="text-[10px] text-slate-400">ফেসবুক, হোয়াটসঅ্যাপ, ক্যামেরা, ফোন</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-pink-400" />
              </button>

              {/* Option 4: Talk with Sara Voice */}
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
                    <p className="text-[10px] text-slate-400">লাইভ বাংলা মিষ্টি ভয়েস অ্যাসিস্ট্যান্ট</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Position Display & Guide Trigger */}
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <button
                onClick={() => setShowOverlayGuide(true)}
                className="text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold"
              >
                <Info className="w-3 h-3" />
                <span>অন্য অ্যাপের ওপর ভাসানোর নিয়ম</span>
              </button>
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
          title="হাত দিয়ে টেনে স্ক্রিনের যেকোনো জায়গায় রাখুন (ট্যাপ করলে কন্ট্রোলার মেনু খুলবে)"
        >
          {/* Outer glowing pulsing ring */}
          <div
            className={`absolute -inset-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 blur-sm transition-opacity ${
              isDragging ? 'opacity-100 animate-none scale-110' : 'opacity-75 animate-pulse'
            }`}
          />

          {/* Circular Orb Body */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 border-2 border-pink-400 flex items-center justify-center shadow-[0_0_25px_rgba(255,46,147,0.7)] overflow-hidden">
            {/* Animated decorative orbit rings */}
            <div className="absolute inset-0 rounded-full border border-pink-400/40 animate-[spin_8s_linear_infinite]" />
            <div className="absolute inset-1 rounded-full border border-cyan-400/30 animate-[spin_5s_linear_infinite_reverse]" />

            {/* Center Core Live Icon */}
            <div className="relative z-10 flex flex-col items-center justify-center text-pink-300 pointer-events-none">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-pink-300" />
              <span className="text-[7px] sm:text-[7.5px] font-black tracking-tighter bg-gradient-to-r from-pink-600 to-purple-600 text-white px-1.5 py-0.2 rounded-full shadow-sm mt-0.5">
                SARA
              </span>
            </div>

            {/* Drag indicator grip icon */}
            <div className="absolute top-1 right-1 opacity-70 pointer-events-none">
              <Move className="w-2.5 h-2.5 text-pink-300" />
            </div>
          </div>

          {/* Quick PiP Float-Over-Apps Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleSystemOverlay();
            }}
            className={`absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-lg flex items-center gap-1 border transition-all active:scale-95 z-30 ${
              isSystemFloatingActive
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-slate-900/95 hover:bg-pink-600 text-pink-300 hover:text-white border-pink-500/50'
            }`}
            title="অন্য যেকোনো অ্যাপের উপরে ভাসিয়ে রাখুন (PiP Mode)"
          >
            <Tv className="w-2.5 h-2.5 text-cyan-300" />
            <span>{isSystemFloatingActive ? 'PiP অন' : 'PiP ভাসান'}</span>
          </button>
        </div>
      </motion.div>

      {/* Guide Modal: How to Float Over Other Apps */}
      {showOverlayGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-pink-500/40 p-5 space-y-4 shadow-[0_0_40px_rgba(255,46,147,0.3)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>অন্য অ্যাপের ওপর ভাসানোর গাইড (System PiP)</span>
              </h3>
              <button
                onClick={() => setShowOverlayGuide(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-1.5">
                <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>১. পিকচার-ইন-পিকচার (PiP) মোড:</span>
                </p>
                <p className="text-slate-400 text-[11px]">
                  'অন্য অ্যাপের ওপর ভাসিয়ে রাখুন' বাটনে চাপলে ব্রাউজার একটি অলওয়েজ-অন-টপ ভাসমান উইন্ডো তৈরি করে। আপনি ইউটিউব, ফেসবুক বা গেমসে ঢুকলেও সারা স্ক্রিনে সবসময় উপরে থাকবে।
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-pink-500/30 space-y-1.5">
                <p className="font-bold text-pink-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-pink-400" />
                  <span>২. অ্যান্ড্রয়েড ফোনে পারমিশন (Android Overlay):</span>
                </p>
                <p className="text-slate-400 text-[11px]">
                  অ্যান্ড্রয়েড সিস্টেমে সেটিংস &gt; Apps &gt; Special App Access &gt; Display over other apps (অন্য অ্যাপের উপরে প্রদর্শন) অন করে রাখলে সরাসরি ফুল সিস্টেম অরবিট চালু থাকে।
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleSystemOverlay}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4" />
              <span>ভাসমান মোড এখনই চালু করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* Direct App Controller Modal */}
      <DirectAppControllerModal
        isOpen={showAppController}
        onClose={() => setShowAppController(false)}
        onOpenVoice={onOpenVoice}
      />
    </>
  );
};
