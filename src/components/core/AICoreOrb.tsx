import React, { useEffect, useRef } from 'react';
import { useSara } from '../../context/SaraContext';

interface AICoreOrbProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const AICoreOrb: React.FC<AICoreOrbProps> = ({
  size = 220,
  className = '',
  onClick,
}) => {
  const { assistantState, isSpeaking, userProfile } = useSara();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;
    const nodeCount = 52;
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
        size: Math.random() * 2 + 1.8,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      // Dynamic rotation speed based on state
      const rotSpeed =
        assistantState === 'THINKING'
          ? 0.035
          : assistantState === 'SPEAKING'
          ? 0.02
          : assistantState === 'LISTENING'
          ? 0.015
          : 0.007;

      rotation += rotSpeed;

      // Primary Core Glowing Radial Gradient
      const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * 1.1);
      if (assistantState === 'SPEAKING') {
        coreGrad.addColorStop(0, '#ff2e93');
        coreGrad.addColorStop(0.4, 'rgba(255, 46, 147, 0.45)');
        coreGrad.addColorStop(1, 'rgba(176, 38, 255, 0)');
      } else if (assistantState === 'LISTENING') {
        coreGrad.addColorStop(0, '#00f2fe');
        coreGrad.addColorStop(0.4, 'rgba(0, 242, 254, 0.4)');
        coreGrad.addColorStop(1, 'rgba(0, 119, 255, 0)');
      } else if (assistantState === 'THINKING') {
        coreGrad.addColorStop(0, '#b026ff');
        coreGrad.addColorStop(0.5, 'rgba(176, 38, 255, 0.5)');
        coreGrad.addColorStop(1, 'rgba(255, 46, 147, 0)');
      } else {
        // Idle state: warm pink/violet
        coreGrad.addColorStop(0, userProfile.loveMode ? '#ff2e93' : '#b026ff');
        coreGrad.addColorStop(0.4, 'rgba(255, 46, 147, 0.3)');
        coreGrad.addColorStop(1, 'rgba(10, 5, 30, 0)');
      }

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Project & rotate 3D nodes
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const cosTilt = Math.cos(0.4);
      const sinTilt = Math.sin(0.4);

      const projected = nodes.map((n) => {
        // Rotate around Y axis
        const x1 = n.x * cosR - n.z * sinR;
        const z1 = n.x * sinR + n.z * cosR;

        // Tilt around X axis
        const y2 = n.y * cosTilt - z1 * sinTilt;
        const z2 = n.y * sinTilt + z1 * cosTilt;

        const scale = (z2 + radius * 2) / (radius * 2);
        return {
          px: cx + x1,
          py: cy + y2,
          pz: z2,
          scale: Math.max(0.3, scale),
          size: n.size * scale,
        };
      });

      // Sort by Z for realistic depth
      projected.sort((a, b) => a.pz - b.pz);

      // Draw interconnecting network lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius * 0.55) {
            const alpha = (1 - dist / (radius * 0.55)) * 0.35 * projected[i].scale;
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

      // Draw 3D nodes
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

      // Outer Tilted Orbital Rings (like the image screenshot)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.35); // Orbit tilt
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.35, radius * 0.38, 0, 0, Math.PI * 2);
      ctx.strokeStyle =
        assistantState === 'SPEAKING'
          ? 'rgba(255, 46, 147, 0.9)'
          : assistantState === 'LISTENING'
          ? 'rgba(0, 242, 254, 0.9)'
          : 'rgba(255, 46, 147, 0.5)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Satellite particle along orbital ring
      const ringAngle = rotation * 2.2;
      const satX = Math.cos(ringAngle) * radius * 1.35;
      const satY = Math.sin(ringAngle) * radius * 0.38;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(satX, satY, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [assistantState, isSpeaking, userProfile.loveMode, size]);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block drop-shadow-[0_0_20px_rgba(255,46,147,0.5)]"
      />
    </div>
  );
};
