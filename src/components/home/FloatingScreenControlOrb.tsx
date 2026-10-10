import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSara } from '../../context/SaraContext';
import { Sparkles, Globe, X, Move } from 'lucide-react';

interface FloatingScreenControlOrbProps {
  onOpenVoice: () => void;
}

export const FloatingScreenControlOrb: React.FC<FloatingScreenControlOrbProps> = ({ onOpenVoice }) => {
  const { screenControlEnabled } = useSara();
  const [showStatusTooltip, setShowStatusTooltip] = useState<boolean>(false);
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
              x: Math.min(Math.max(10, parsed.x), window.innerWidth - 65),
              y: Math.min(Math.max(60, parsed.y), window.innerHeight - 130),
            };
          }
        }
      } catch (e) {}
      return {
        x: Math.max(16, window.innerWidth - 75),
        y: Math.max(80, window.innerHeight - 150),
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
        const orbSize = 58;
        const maxX = Math.max(10, window.innerWidth - orbSize - 10);
        const maxY = Math.max(60, window.innerHeight - orbSize - 75);
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(50, prev.y), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Drag Handlers attached to window while dragging
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - dragStartRef.current.startX;
    const dy = clientY - dragStartRef.current.startY;

    if (Math.hypot(dx, dy) > 5) {
      dragStartRef.current.hasMoved = true;
    }

    const orbSize = 58;
    const maxX = Math.max(10, window.innerWidth - orbSize - 10);
    const maxY = Math.max(60, window.innerHeight - orbSize - 70);

    const newX = Math.max(10, Math.min(maxX, dragStartRef.current.initialOrbX + dx));
    const newY = Math.max(40, Math.min(maxY, dragStartRef.current.initialOrbY + dy));

    setPosition({ x: newX, y: newY });
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);

    // Save final position to localStorage
    try {
      localStorage.setItem('sara_screen_orb_pos', JSON.stringify(positionRef.current));
    } catch (e) {}

    // Subtle tactile feedback on release
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch (e) {}
    }

    // If user clicked or tapped without dragging (< 6px movement), open voice modal
    if (!dragStartRef.current.hasMoved) {
      onOpenVoice();
    }
  }, [onOpenVoice]);

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

  // Window listeners active only during drag
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
        // Prevent default screen scrolling on mobile while dragging the floating orb
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
      {/* Tooltip / Status info */}
      {showStatusTooltip && !isDragging && (
        <div className="absolute bottom-16 right-0 glass-card-pink border border-pink-500/40 p-3 rounded-2xl shadow-[0_0_20px_rgba(255,46,147,0.4)] text-xs text-slate-100 w-64 animate-in fade-in zoom-in-95 pointer-events-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 font-bold text-pink-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>SARA স্ক্রিন কন্ট্রোলার</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusTooltip(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300">
            হাত দিয়ে টেনে স্ক্রিনের যেকোনো জায়গায় রাখতে পারবেন। ট্যাপ করলে সারা ভয়েস অ্যাসিস্ট্যান্ট ওপেন হবে।
          </p>
        </div>
      )}

      {/* Floating Draggable Orb */}
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
        onMouseEnter={() => setShowStatusTooltip(true)}
        className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
          isDragging ? 'scale-115 shadow-[0_0_35px_rgba(255,46,147,0.9)]' : 'hover:scale-105 active:scale-95'
        }`}
        title="স্ক্রিন কন্ট্রোলার (হাত দিয়ে টেনে যেকোনো জায়গায় রাখুন)"
      >
        {/* Outer glowing pulsing ring */}
        <div
          className={`absolute -inset-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 blur-sm transition-opacity ${
            isDragging ? 'opacity-100 animate-none scale-110' : 'opacity-70 animate-pulse'
          }`}
        />

        {/* Circular Orb Body */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 border-2 border-pink-400/90 flex items-center justify-center shadow-[0_0_25px_rgba(255,46,147,0.6)] overflow-hidden">
          {/* Animated decorative orbit rings */}
          <div className="absolute inset-0 rounded-full border border-pink-400/30 animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-1 rounded-full border border-cyan-400/25 animate-[spin_6s_linear_infinite_reverse]" />

          {/* Center Core Live Icon */}
          <div className="relative z-10 flex flex-col items-center justify-center text-pink-300 pointer-events-none">
            <Globe className="w-6 h-6 animate-pulse text-pink-300" />
            <span className="absolute -bottom-1 text-[8px] font-bold tracking-tighter bg-pink-600 text-white px-1 rounded-full shadow-sm">
              LIVE
            </span>
          </div>

          {/* Drag indicator grip icon */}
          <div className="absolute top-1 right-1 opacity-60 pointer-events-none">
            <Move className="w-2.5 h-2.5 text-pink-300" />
          </div>
        </div>
      </div>
    </div>
  );
};
