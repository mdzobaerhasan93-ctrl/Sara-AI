import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSara } from '../../context/SaraContext';
import { Sparkles, Move, Hand } from 'lucide-react';

interface AICoreOrbProps {
  size?: number;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const AICoreOrb: React.FC<AICoreOrbProps> = ({
  size = 220,
  className = '',
  onClick,
  interactive = true,
}) => {
  const { assistantState, isSpeaking, userProfile } = useSara();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dragging & Interaction State
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Position offset for physical hand dragging
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs for 3D physics state
  const physicsRef = useRef({
    rotY: 0,
    rotX: 0.35, // Orbit tilt
    velY: 0.008,
    velX: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    dragDisplacementX: 0,
    dragDisplacementY: 0,
    touchParticles: [] as Array<{ x: number; y: number; alpha: number; color: string }>,
  });

  // Touch and Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    physicsRef.current.isDragging = true;
    physicsRef.current.lastX = e.clientX;
    physicsRef.current.lastY = e.clientY;
    setIsInteracting(true);
    setHasInteracted(true);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!physicsRef.current.isDragging) return;

    const dx = e.clientX - physicsRef.current.lastX;
    const dy = e.clientY - physicsRef.current.lastY;

    physicsRef.current.lastX = e.clientX;
    physicsRef.current.lastY = e.clientY;

    // Apply rotation based on hand gesture
    physicsRef.current.rotY += dx * 0.018;
    physicsRef.current.rotX = Math.max(-1.2, Math.min(1.2, physicsRef.current.rotX + dy * 0.012));

    // Instant velocity for momentum
    physicsRef.current.velY = dx * 0.008;
    physicsRef.current.velX = dy * 0.005;

    // Hand physical displacement (elastic spring)
    const newDispX = Math.max(-45, Math.min(45, physicsRef.current.dragDisplacementX + dx * 0.4));
    const newDispY = Math.max(-40, Math.min(40, physicsRef.current.dragDisplacementY + dy * 0.4));
    physicsRef.current.dragDisplacementX = newDispX;
    physicsRef.current.dragDisplacementY = newDispY;
    setDragOffset({ x: newDispX, y: newDispY });

    // Add glowing touch sparkle particles
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      physicsRef.current.touchParticles.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        alpha: 1.0,
        color: Math.random() > 0.5 ? '#ff2e93' : '#00f2fe',
      });
      if (physicsRef.current.touchParticles.length > 25) {
        physicsRef.current.touchParticles.shift();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!physicsRef.current.isDragging) return;
    physicsRef.current.isDragging = false;
    setIsInteracting(false);

    // If movement was negligible, trigger click
    const totalDist = Math.hypot(
      physicsRef.current.dragDisplacementX,
      physicsRef.current.dragDisplacementY
    );
    if (totalDist < 5 && onClick) {
      onClick();
    }
  };

  // 3D Canvas Rendering Loop with Fibonacci sphere point-cloud and tilted orbital rings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const nodeCount = 56;
    const nodes: Array<{ x: number; y: number; z: number; size: number }> = [];

    // Generate 3D sphere surface points (Fibonacci sphere distribution)
    const radius = size * 0.38;
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      nodes.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        size: Math.random() * 2.2 + 1.8,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      const pState = physicsRef.current;

      // Handle physics momentum & damping
      if (!pState.isDragging) {
        // Natural return rotation speed based on assistant state
        const targetRotSpeed =
          assistantState === 'THINKING'
            ? 0.035
            : assistantState === 'SPEAKING'
            ? 0.022
            : assistantState === 'LISTENING'
            ? 0.016
            : 0.007;

        // Dampen manual gesture momentum towards target ambient speed
        pState.velY = pState.velY * 0.94 + targetRotSpeed * 0.06;
        pState.velX = pState.velX * 0.92;
        pState.rotY += pState.velY;
        pState.rotX += pState.velX;

        // Smoothly spring displacement back to 0
        if (Math.abs(pState.dragDisplacementX) > 0.1 || Math.abs(pState.dragDisplacementY) > 0.1) {
          pState.dragDisplacementX *= 0.88;
          pState.dragDisplacementY *= 0.88;
          setDragOffset({ x: pState.dragDisplacementX, y: pState.dragDisplacementY });
        }
      }

      // Primary Core Glowing Radial Gradient
      const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * 1.15);
      if (assistantState === 'SPEAKING') {
        coreGrad.addColorStop(0, '#ff2e93');
        coreGrad.addColorStop(0.35, 'rgba(255, 46, 147, 0.55)');
        coreGrad.addColorStop(1, 'rgba(176, 38, 255, 0)');
      } else if (assistantState === 'LISTENING') {
        coreGrad.addColorStop(0, '#00f2fe');
        coreGrad.addColorStop(0.35, 'rgba(0, 242, 254, 0.45)');
        coreGrad.addColorStop(1, 'rgba(0, 119, 255, 0)');
      } else if (assistantState === 'THINKING') {
        coreGrad.addColorStop(0, '#b026ff');
        coreGrad.addColorStop(0.45, 'rgba(176, 38, 255, 0.55)');
        coreGrad.addColorStop(1, 'rgba(255, 46, 147, 0)');
      } else {
        // Idle state: warm pink/violet
        coreGrad.addColorStop(0, userProfile.loveMode ? '#ff2e93' : '#b026ff');
        coreGrad.addColorStop(0.4, 'rgba(255, 46, 147, 0.35)');
        coreGrad.addColorStop(1, 'rgba(10, 5, 30, 0)');
      }

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic 3D Matrix Rotation based on hand drag rotY and rotX
      const cosY = Math.cos(pState.rotY);
      const sinY = Math.sin(pState.rotY);
      const cosX = Math.cos(pState.rotX);
      const sinX = Math.sin(pState.rotX);

      const projected = nodes.map((n) => {
        // Rotate around Y axis
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.x * sinY + n.z * cosY;

        // Tilt & rotate around X axis
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;

        const scale = (z2 + radius * 2) / (radius * 2);
        return {
          px: cx + x1,
          py: cy + y2,
          pz: z2,
          scale: Math.max(0.25, scale),
          size: n.size * scale,
        };
      });

      // Sort by Z for realistic depth
      projected.sort((a, b) => a.pz - b.pz);

      // Draw interconnecting network lines
      ctx.lineWidth = 0.85;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius * 0.58) {
            const alpha = (1 - dist / (radius * 0.58)) * 0.4 * projected[i].scale;
            ctx.strokeStyle =
              assistantState === 'LISTENING'
                ? `rgba(0, 242, 254, ${alpha})`
                : `rgba(255, 46, 147, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.stroke();
          }
        }
      }

      // Draw 3D nodes with glow
      for (const p of projected) {
        ctx.fillStyle =
          assistantState === 'LISTENING'
            ? '#00f2fe'
            : p.pz > 0
            ? '#ff70a6'
            : '#b026ff';
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outer Tilted Orbital Rings (dynamically responding to hand drag!)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(pState.rotX); // Orbit responds to vertical hand drag

      // Primary Ring
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.38, radius * 0.42, 0, 0, Math.PI * 2);
      ctx.strokeStyle =
        assistantState === 'SPEAKING'
          ? 'rgba(255, 46, 147, 0.95)'
          : assistantState === 'LISTENING'
          ? 'rgba(0, 242, 254, 0.95)'
          : pState.isDragging
          ? 'rgba(255, 46, 147, 0.95)'
          : 'rgba(255, 46, 147, 0.65)';
      ctx.lineWidth = pState.isDragging ? 2.5 : 1.8;
      ctx.stroke();

      // Secondary Counter-Orbit Ring
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.25, radius * 0.32, Math.PI / 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Satellite particle along orbital ring
      const ringAngle = pState.rotY * 2.4;
      const satX = Math.cos(ringAngle) * radius * 1.38;
      const satY = Math.sin(ringAngle) * radius * 0.42;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(satX, satY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Satellite particle 2
      const sat2X = Math.cos(-ringAngle * 0.8) * radius * 1.25;
      const sat2Y = Math.sin(-ringAngle * 0.8) * radius * 0.32;
      ctx.fillStyle = '#ff70a6';
      ctx.beginPath();
      ctx.arc(sat2X, sat2Y, 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Render touch gesture sparkles
      for (let i = pState.touchParticles.length - 1; i >= 0; i--) {
        const pt = pState.touchParticles[i];
        pt.alpha -= 0.04;
        if (pt.alpha <= 0) {
          pState.touchParticles.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = pt.alpha;
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3 * pt.alpha, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [assistantState, isSpeaking, userProfile.loveMode, size]);

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
        transition: isInteracting ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative inline-flex items-center justify-center cursor-grab active:cursor-grabbing touch-none transition-transform ${
          isInteracting ? 'scale-105' : 'hover:scale-102'
        }`}
        style={{ width: size, height: size }}
        title="অরবিট হাত দিয়ে স্পর্শ করে যেকোনো দিকে ঘুরান বা নাড়ান"
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className={`block transition-shadow ${
            isInteracting
              ? 'drop-shadow-[0_0_35px_rgba(255,46,147,0.85)]'
              : 'drop-shadow-[0_0_20px_rgba(255,46,147,0.5)]'
          }`}
        />

        {/* Floating hand drag indicator badge */}
        <div className="absolute -bottom-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-pink-500/40 text-[9px] font-bold text-pink-300 shadow-lg pointer-events-none transition-opacity">
          <Hand className="w-3 h-3 text-pink-400 animate-pulse" />
          <span>{isInteracting ? 'হাত দিয়ে ঘোরানো হচ্ছে...' : 'হাত দিয়ে ঘুরান ও নাড়ান'}</span>
        </div>
      </div>
    </div>
  );
};
