import React, { useEffect, useRef } from 'react';
import { EmotionState } from '../../types';

export interface EmotionVisualConfig {
  name: string;
  labelBengali: string;
  sentiment: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  backgroundGlow: string;
  shapes: Array<'circle' | 'sparkle' | 'heart' | 'star' | 'dewdrop' | 'ring'>;
  speedMultiplier: number;
  turbulence: number;
  spawnRate: number;
  description: string;
}

export const EMOTION_CONFIGS: Record<EmotionState, EmotionVisualConfig> = {
  romantic: {
    name: 'Romantic',
    labelBengali: 'রোমান্টিক ও ভালোবাসা',
    sentiment: 'Affectionate & Tender',
    primaryColor: '#ff2d75',
    secondaryColor: '#ff7597',
    accentColor: '#ff1493',
    glowColor: 'rgba(255, 45, 117, 0.45)',
    backgroundGlow: 'radial-gradient(circle, rgba(255,45,117,0.3) 0%, rgba(255,20,147,0.08) 60%, transparent 80%)',
    shapes: ['heart', 'sparkle', 'circle'],
    speedMultiplier: 1.1,
    turbulence: 0.6,
    spawnRate: 4,
    description: 'Radiant rose & ruby hearts with swirling passionate stardust',
  },
  happy: {
    name: 'Happy',
    labelBengali: 'আনন্দিত ও প্রফুল্ল',
    sentiment: 'Joyful & Warm',
    primaryColor: '#f59e0b',
    secondaryColor: '#fbbf24',
    accentColor: '#fde047',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    backgroundGlow: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(251,191,36,0.08) 60%, transparent 80%)',
    shapes: ['star', 'sparkle', 'circle'],
    speedMultiplier: 1.25,
    turbulence: 0.8,
    spawnRate: 4,
    description: 'Golden sunburst stars and joyous buoyant amber sparkles',
  },
  excited: {
    name: 'Excited',
    labelBengali: 'উত্তেজিত ও উচ্ছ্বসিত',
    sentiment: 'High-Energy & Electric',
    primaryColor: '#00f2fe',
    secondaryColor: '#f72585',
    accentColor: '#7209b7',
    glowColor: 'rgba(0, 242, 254, 0.5)',
    backgroundGlow: 'radial-gradient(circle, rgba(0,242,254,0.3) 0%, rgba(247,37,133,0.12) 60%, transparent 80%)',
    shapes: ['sparkle', 'star', 'ring'],
    speedMultiplier: 2.0,
    turbulence: 1.5,
    spawnRate: 6,
    description: 'Electric neon cyan & magenta fireworks with dynamic energy streaks',
  },
  playful: {
    name: 'Playful',
    labelBengali: 'কৌতুকপূর্ণ ও মিষ্টি',
    sentiment: 'Whimsical & Teasing',
    primaryColor: '#c084fc',
    secondaryColor: '#fb923c',
    accentColor: '#f472b6',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    backgroundGlow: 'radial-gradient(circle, rgba(192,132,252,0.25) 0%, rgba(251,146,60,0.1) 60%, transparent 80%)',
    shapes: ['circle', 'sparkle', 'ring'],
    speedMultiplier: 1.3,
    turbulence: 1.2,
    spawnRate: 4,
    description: 'Lavender, peach & candy-pink undulating playful confetti particles',
  },
  caring: {
    name: 'Caring',
    labelBengali: 'যত্নশীল ও মমতাময়ী',
    sentiment: 'Gentle & Nurturing',
    primaryColor: '#2dd4bf',
    secondaryColor: '#14b8a6',
    accentColor: '#f472b6',
    glowColor: 'rgba(45, 212, 191, 0.4)',
    backgroundGlow: 'radial-gradient(circle, rgba(45,212,191,0.22) 0%, rgba(244,114,182,0.08) 60%, transparent 80%)',
    shapes: ['circle', 'sparkle', 'ring'],
    speedMultiplier: 0.8,
    turbulence: 0.4,
    spawnRate: 3,
    description: 'Soothing emerald mint & gentle blush halo motes with breathing rhythm',
  },
  surprised: {
    name: 'Surprised',
    labelBengali: 'বিস্মিত ও চমৎকৃত',
    sentiment: 'Awe & Wonder',
    primaryColor: '#38bdf8',
    secondaryColor: '#facc15',
    accentColor: '#e879f9',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    backgroundGlow: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(250,204,21,0.1) 60%, transparent 80%)',
    shapes: ['ring', 'star', 'sparkle'],
    speedMultiplier: 1.7,
    turbulence: 1.0,
    spawnRate: 5,
    description: 'Expanding shockwave luminous rings with sparkling starbursts',
  },
  thinking: {
    name: 'Thinking',
    labelBengali: 'চিন্তাশীল ও মনোযোগী',
    sentiment: 'Contemplative & Cosmic',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    backgroundGlow: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(6,182,212,0.08) 60%, transparent 80%)',
    shapes: ['sparkle', 'circle', 'ring'],
    speedMultiplier: 0.9,
    turbulence: 0.5,
    spawnRate: 3,
    description: 'Indigo & cosmic violet celestial nodes orbiting in constellation paths',
  },
  sad: {
    name: 'Melancholic',
    labelBengali: 'সহানুভূতিশীল ও বিষাদগ্রস্ত',
    sentiment: 'Tender & Sympathetic',
    primaryColor: '#60a5fa',
    secondaryColor: '#94a3b8',
    accentColor: '#818cf8',
    glowColor: 'rgba(96, 165, 250, 0.35)',
    backgroundGlow: 'radial-gradient(circle, rgba(96,165,250,0.2) 0%, rgba(148,163,184,0.06) 60%, transparent 80%)',
    shapes: ['dewdrop', 'circle'],
    speedMultiplier: 0.7,
    turbulence: 0.3,
    spawnRate: 2,
    description: 'Gentle mist & twilight raindrops slowly descending with soft ripples',
  },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxLife: number;
  life: number;
  color: string;
  secondaryColor: string;
  shape: 'circle' | 'sparkle' | 'heart' | 'star' | 'dewdrop' | 'ring';
  angle: number;
  vAngle: number;
  alpha: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobbleOffset: number;
}

interface EmotionParticleVisualizerProps {
  emotion?: EmotionState;
  isSpeaking: boolean;
  audioFrequencyData?: number[];
  className?: string;
  interactive?: boolean;
}

export const EmotionParticleVisualizer: React.FC<EmotionParticleVisualizerProps> = ({
  emotion = 'caring',
  isSpeaking,
  audioFrequencyData = [15, 25, 45, 30, 20],
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Audio power normalized (0.0 to 1.0)
  const audioEnergy = isSpeaking
    ? Math.min(
        1.0,
        (audioFrequencyData.reduce((acc, val) => acc + val, 0) /
          Math.max(1, audioFrequencyData.length * 60)) * 1.5
      )
    : 0;

  const currentConfig = EMOTION_CONFIGS[emotion] || EMOTION_CONFIGS.caring;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const handleResize = () => {
      if (!container || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const maxParticles = 90;
    let frameCount = 0;

    // Helper: Draw Heart
    const drawHeart = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      // top left curve
      c.bezierCurveTo(-size / 2, -size / 2, -size, topCurveHeight / 3, 0, size);
      // top right curve
      c.bezierCurveTo(size, topCurveHeight / 3, size / 2, -size / 2, 0, topCurveHeight);
      c.closePath();
      c.fill();
    };

    // Helper: Draw 4-point Diamond Sparkle
    const drawSparkle = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.moveTo(0, -size);
      c.quadraticCurveTo(0, 0, size, 0);
      c.quadraticCurveTo(0, 0, 0, size);
      c.quadraticCurveTo(0, 0, -size, 0);
      c.quadraticCurveTo(0, 0, 0, -size);
      c.closePath();
      c.fill();
    };

    // Helper: Draw 5-point Star
    const drawStar = (c: CanvasRenderingContext2D, size: number) => {
      const spikes = 5;
      const outerRadius = size;
      const innerRadius = size * 0.45;
      let rot = (Math.PI / 2) * 3;
      let x = 0;
      let y = 0;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(0, -outerRadius);
      c.closePath();
      c.fill();
    };

    // Helper: Draw Dewdrop (teardrop)
    const drawDewdrop = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.moveTo(0, -size);
      c.bezierCurveTo(size * 0.7, 0, size * 0.7, size, 0, size);
      c.bezierCurveTo(-size * 0.7, size, -size * 0.7, 0, 0, -size);
      c.closePath();
      c.fill();
    };

    // Helper: Draw Ring
    const drawRing = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.arc(0, 0, size, 0, Math.PI * 2);
      c.lineWidth = Math.max(1, size * 0.2);
      c.stroke();
    };

    const spawnParticle = (forceCenter = false) => {
      if (particles.length >= maxParticles) return;

      const cfg = currentConfig;
      const centerX = width / 2;
      const centerY = height / 2;

      // When speaking, spawn predominantly from avatar core outwards
      let startX = centerX;
      let startY = centerY;

      if (!isSpeaking && !forceCenter) {
        // Random gentle ambient drift
        startX = centerX + (Math.random() - 0.5) * (width * 0.7);
        startY = centerY + (Math.random() - 0.5) * (height * 0.6);
      } else {
        // Core emission with radial offset
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 80;
        startX = centerX + Math.cos(angle) * dist;
        startY = centerY + Math.sin(angle) * dist;
      }

      // Direction vector
      let vx = 0;
      let vy = 0;
      const speed = (0.5 + Math.random() * 1.5) * cfg.speedMultiplier * (1 + audioEnergy * 1.2);

      if (cfg.name === 'Melancholic') {
        // Sad: downward rainfall drift
        vx = (Math.random() - 0.5) * 0.5;
        vy = (0.8 + Math.random() * 1.5) * cfg.speedMultiplier;
      } else if (cfg.name === 'Thinking') {
        // Thinking: orbital tangential velocity
        const dx = startX - centerX;
        const dy = startY - centerY;
        const rad = Math.sqrt(dx * dx + dy * dy) || 1;
        vx = (-dy / rad) * speed * 0.9 + (Math.random() - 0.5) * 0.3;
        vy = (dx / rad) * speed * 0.9 + (Math.random() - 0.5) * 0.3;
      } else {
        // Radial outwards or buoyant upwards
        const angle = Math.random() * Math.PI * 2;
        const upwardBias = cfg.name === 'Romantic' || cfg.name === 'Happy' ? -0.8 : -0.2;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed + upwardBias;
      }

      const availableShapes = cfg.shapes;
      const shape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
      const colorPalette = [cfg.primaryColor, cfg.secondaryColor, cfg.accentColor];
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

      const baseSize = 4 + Math.random() * 6 + (isSpeaking ? audioEnergy * 6 : 0);
      const life = 50 + Math.random() * 60 + (isSpeaking ? 30 : 0);

      particles.push({
        x: startX,
        y: startY,
        vx,
        vy,
        size: baseSize,
        maxLife: life,
        life,
        color,
        secondaryColor: cfg.accentColor,
        shape,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.08,
        alpha: 0,
        wobbleSpeed: 0.02 + Math.random() * 0.04,
        wobbleAmp: 0.5 + Math.random() * 1.5,
        wobbleOffset: Math.random() * Math.PI * 2,
      });
    };

    // Render loop
    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Determine spawn frequency based on speech & audio activity
      const cfg = currentConfig;
      const spawnCount = isSpeaking
        ? Math.floor(cfg.spawnRate * (1 + audioEnergy * 2.2))
        : frameCount % 3 === 0
        ? 1
        : 0;

      for (let s = 0; s < spawnCount; s++) {
        spawnParticle();
      }

      // Composite mode for glowing luminous magic
      ctx.globalCompositeOperation = 'screen';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Fade in & fade out smoothly
        const lifeProgress = 1 - p.life / p.maxLife;
        if (lifeProgress < 0.2) {
          p.alpha = lifeProgress / 0.2;
        } else if (lifeProgress > 0.7) {
          p.alpha = (1 - lifeProgress) / 0.3;
        } else {
          p.alpha = 1;
        }

        // Apply audio energy boost to alpha
        const currentAlpha = Math.min(1, p.alpha * (0.8 + audioEnergy * 0.4));

        // Movement with turbulence & wobble
        p.x += p.vx + Math.sin(frameCount * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp * cfg.turbulence;
        p.y += p.vy;
        p.angle += p.vAngle;

        // Render particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = currentAlpha;

        // Glowing shadow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * (1.5 + audioEnergy * 2);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        switch (p.shape) {
          case 'heart':
            drawHeart(ctx, p.size);
            break;
          case 'sparkle':
            drawSparkle(ctx, p.size);
            break;
          case 'star':
            drawStar(ctx, p.size);
            break;
          case 'dewdrop':
            drawDewdrop(ctx, p.size);
            break;
          case 'ring':
            drawRing(ctx, p.size);
            break;
          case 'circle':
          default:
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            break;
        }

        ctx.restore();
      }

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [emotion, isSpeaking, audioEnergy, currentConfig]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {/* Ambient Radial Emotion Glow Backdrop */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out pointer-events-none opacity-80"
        style={{
          background: isSpeaking ? currentConfig.backgroundGlow : 'none',
        }}
      />

      {/* HTML5 Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
};
