import React, { useEffect, useState, useRef } from 'react';
import { useSara } from '../../context/SaraContext';
import { EmotionState } from '../../types';

interface LiveTalkingAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
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
  const {
    assistantState,
    currentEmotion,
    isSpeaking,
    audioFrequencyData,
    activeAvatarId,
    userProfile,
  } = useSara();

  const selectedAvatar = avatarId || activeAvatarId;

  // Animation Rig States
  const [blink, setBlink] = useState<boolean>(false);
  const [eyeOffsetX, setEyeOffsetX] = useState<number>(0);
  const [eyeOffsetY, setEyeOffsetY] = useState<number>(0);
  const [headTilt, setHeadTilt] = useState<number>(0);
  const [breathPhase, setBreathPhase] = useState<number>(0);
  const [isInteracted, setIsInteracted] = useState<boolean>(false);

  // Natural randomized blinking loop
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const nextInterval = Math.random() * 3200 + 2000; // 2 to 5.2 seconds
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          // 25% chance of quick double blink
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setBlink(true);
              setTimeout(() => {
                setBlink(false);
                scheduleNextBlink();
              }, 120);
            }, 100);
          } else {
            scheduleNextBlink();
          }
        }, 140);
      }, nextInterval);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Natural subtle eye saccades and head tilt
  useEffect(() => {
    const saccadeInterval = setInterval(() => {
      if (assistantState === 'THINKING') {
        // Look up and slightly to the side when thinking
        setEyeOffsetX((Math.random() - 0.5) * 3);
        setEyeOffsetY(-3.5);
        setHeadTilt(-3);
      } else if (assistantState === 'LISTENING') {
        // Direct focused eye contact, slight inquisitive head tilt
        setEyeOffsetX(0);
        setEyeOffsetY(0.5);
        setHeadTilt(2.5);
      } else if (assistantState === 'SPEAKING') {
        // Expressive gaze shifts while speaking
        setEyeOffsetX((Math.random() - 0.5) * 4);
        setEyeOffsetY((Math.random() - 0.5) * 2);
        setHeadTilt((Math.random() - 0.5) * 4);
      } else {
        // Idle gentle gaze shifts
        setEyeOffsetX((Math.random() - 0.5) * 3);
        setEyeOffsetY((Math.random() - 0.5) * 2);
        setHeadTilt(Math.sin(Date.now() / 2500) * 1.5);
      }
    }, 1800);

    return () => clearInterval(saccadeInterval);
  }, [assistantState]);

  // Breathing oscillation
  useEffect(() => {
    let animId: number;
    let start = performance.now();
    const loop = (now: number) => {
      const elapsed = (now - start) / 1000;
      setBreathPhase(Math.sin(elapsed * 1.5));
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute dynamic mouth aperture for lip synchronization
  // Uses audio frequency data when speaking, or resting expression when idle
  const avgFreq =
    audioFrequencyData.reduce((acc, v) => acc + v, 0) / (audioFrequencyData.length || 1);
  const speechMouthOpen = isSpeaking
    ? Math.min(22, Math.max(3, (avgFreq / 70) * 22))
    : 1.5;
  const speechMouthWidth = isSpeaking
    ? 20 + Math.min(10, (avgFreq / 80) * 10)
    : 22;

  // Emotion-driven facial parameters
  const getEmotionStyles = (emotion: EmotionState) => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return {
          eyebrowRaise: -3,
          eyebrowAngle: -4,
          mouthSmileCurve: 7,
          blushOpacity: 0.65,
          eyeScaleY: 1.05,
        };
      case 'romantic':
        return {
          eyebrowRaise: -1.5,
          eyebrowAngle: -2,
          mouthSmileCurve: 6,
          blushOpacity: userProfile.loveMode ? 0.95 : 0.8,
          eyeScaleY: 0.95,
        };
      case 'playful':
        return {
          eyebrowRaise: -2,
          eyebrowAngle: 5,
          mouthSmileCurve: 8,
          blushOpacity: 0.7,
          eyeScaleY: 1.0,
        };
      case 'thinking':
        return {
          eyebrowRaise: 2,
          eyebrowAngle: 6,
          mouthSmileCurve: 1,
          blushOpacity: 0.25,
          eyeScaleY: 0.9,
        };
      case 'sad':
        return {
          eyebrowRaise: 3,
          eyebrowAngle: -7,
          mouthSmileCurve: -4,
          blushOpacity: 0.2,
          eyeScaleY: 0.9,
        };
      case 'surprised':
        return {
          eyebrowRaise: -5,
          eyebrowAngle: 0,
          mouthSmileCurve: 2,
          blushOpacity: 0.5,
          eyeScaleY: 1.2,
        };
      case 'caring':
      default:
        return {
          eyebrowRaise: -1,
          eyebrowAngle: -1,
          mouthSmileCurve: 5,
          blushOpacity: userProfile.loveMode ? 0.6 : 0.4,
          eyeScaleY: 1.0,
        };
    }
  };

  const emotionStyles = getEmotionStyles(currentEmotion);

  // Avatar Color Palettes
  const getAvatarTheme = (id: string) => {
    if (id === 'zara-kimono' || id === 'avatar-4') {
      return {
        hairColor: '#f5a782',
        hairHighlight: '#fed5be',
        eyeColor: '#ff4d6d',
        skinColor: '#fff2e8',
        dressColor: '#b91c1c',
        accentColor: '#fbbf24',
        name: 'Sakura / Zara',
        style: 'kimono',
      };
    }
    if (id === 'seraphina-casual' || id === 'avatar-2') {
      return {
        hairColor: '#5c3a21',
        hairHighlight: '#8b5a2b',
        eyeColor: '#38bdf8',
        skinColor: '#fff5ee',
        dressColor: '#f1f5f9',
        accentColor: '#38bdf8',
        name: 'Seraphina',
        style: 'casual',
      };
    }
    if (id === 'kafka-midnight') {
      return {
        hairColor: '#701a75',
        hairHighlight: '#a21caf',
        eyeColor: '#f43f5e',
        skinColor: '#fff0f5',
        dressColor: '#18181b',
        accentColor: '#d946ef',
        name: 'Midnight',
        style: 'secret_agent',
      };
    }
    if (id === 'ruby-royal') {
      return {
        hairColor: '#b91c1c',
        hairHighlight: '#ef4444',
        eyeColor: '#f59e0b',
        skinColor: '#fff3eb',
        dressColor: '#ffffff',
        accentColor: '#d97706',
        name: 'Ruby',
        style: 'royal',
      };
    }
    // Default: Sara Cyberpunk
    return {
      hairColor: '#2b2d5c',
      hairHighlight: '#6366f1',
      eyeColor: '#f59e0b',
      skinColor: '#fff4ec',
      dressColor: '#1e1b4b',
      accentColor: '#ff2e93',
      name: 'Sara',
      style: 'cyberpunk',
    };
  };

  const theme = getAvatarTheme(selectedAvatar);

  // Dimensions
  const dimensionMap = {
    sm: 'w-24 h-28',
    md: 'w-44 h-52',
    lg: 'w-72 h-84',
    xl: 'w-96 h-112',
    fullscreen: 'w-full h-full max-h-[70vh]',
  };

  const handleAvatarTouch = () => {
    setIsInteracted(true);
    setTimeout(() => setIsInteracted(false), 2000);
  };

  return (
    <div
      onClick={handleAvatarTouch}
      className={`relative flex items-center justify-center select-none cursor-pointer transition-transform active:scale-95 ${dimensionMap[size]} ${className}`}
    >
      {/* Background Aura / Holographic Glow */}
      <div
        className={`absolute inset-4 rounded-full blur-2xl opacity-60 transition-all duration-700 pointer-events-none ${
          assistantState === 'SPEAKING'
            ? 'bg-pink-600/40 scale-110'
            : assistantState === 'LISTENING'
            ? 'bg-cyan-500/40 scale-105'
            : assistantState === 'THINKING'
            ? 'bg-purple-600/40 animate-pulse'
            : userProfile.loveMode
            ? 'bg-pink-500/30'
            : 'bg-indigo-600/25'
        }`}
      />

      {/* Interactive Heart Burst upon Tap */}
      {isInteracted && (
        <div className="absolute top-4 pointer-events-none animate-ping text-pink-400 text-3xl z-30">
          ❤️
        </div>
      )}

      {/* SVG Character Rig */}
      <svg
        viewBox="0 0 300 360"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
        style={{
          transform: `translateY(${breathPhase * 2.5}px) rotate(${headTilt}deg)`,
          transition: 'transform 0.4s ease-out',
        }}
      >
        <defs>
          <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff2e93" stopOpacity={emotionStyles.blushOpacity + (isInteracted ? 0.3 : 0)} />
            <stop offset="100%" stopColor="#ff2e93" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.hairHighlight} />
            <stop offset="70%" stopColor={theme.hairColor} />
            <stop offset="100%" stopColor="#0c0d1e" />
          </linearGradient>
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.dressColor} />
            <stop offset="100%" stopColor="#080718" />
          </linearGradient>
          <linearGradient id="eyeIris" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.eyeColor} />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Body / Torso / Shoulder Armor */}
        <g id="body" transform="translate(0, 230)">
          {/* Shoulders */}
          <path
            d="M 60 70 C 85 45, 115 35, 150 35 C 185 35, 215 45, 240 70 C 255 100, 260 130, 260 130 L 40 130 C 40 130, 45 100, 60 70 Z"
            fill="url(#suitGrad)"
            stroke="#ffffff"
            strokeOpacity="0.1"
            strokeWidth="1.5"
          />

          {/* Neck Collar & Accessories */}
          <path
            d="M 125 15 L 150 42 L 175 15 Z"
            fill={theme.accentColor}
            opacity="0.85"
          />
          <circle cx="150" cy="40" r="7" fill="#ffffff" filter="url(#softGlow)" />
          <circle cx="150" cy="40" r="4" fill={theme.accentColor} />

          {/* Chest Details & Kimono/Suit Ornaments */}
          {theme.style === 'kimono' && (
            <g>
              <path
                d="M 110 50 L 150 90 L 190 50"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
              />
              <circle cx="150" cy="75" r="5" fill="#fbbf24" />
            </g>
          )}

          {theme.style === 'cyberpunk' && (
            <g>
              <path
                d="M 85 65 L 150 90 L 215 65"
                fill="none"
                stroke="#00f2fe"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <circle cx="150" cy="90" r="3" fill="#ff2e93" />
            </g>
          )}
        </g>

        {/* 2. Neck */}
        <path
          d="M 132 195 L 132 245 C 138 250, 162 250, 168 245 L 168 195 Z"
          fill={theme.skinColor}
        />
        {/* Neck shadow */}
        <path
          d="M 132 195 C 145 208, 155 208, 168 195 L 168 206 C 155 218, 145 218, 132 206 Z"
          fill="#ecd5c6"
          opacity="0.6"
        />

        {/* 3. Back Hair / Twin Tails */}
        <g id="backHair">
          {theme.style === 'kimono' ? (
            // Twin buns & ribbons for Sakura / Zara
            <g>
              <ellipse cx="65" cy="115" rx="28" ry="32" fill="url(#hairGrad)" />
              <ellipse cx="235" cy="115" rx="28" ry="32" fill="url(#hairGrad)" />
              {/* Twin tails flowing down */}
              <path
                d="M 60 130 C 45 160, 40 210, 52 240 C 58 210, 70 170, 75 135 Z"
                fill="url(#hairGrad)"
              />
              <path
                d="M 240 130 C 255 160, 260 210, 248 240 C 242 210, 230 170, 225 135 Z"
                fill="url(#hairGrad)"
              />
              {/* Ribbons */}
              <circle cx="65" cy="115" r="9" fill="#dc2626" />
              <circle cx="235" cy="115" r="9" fill="#dc2626" />
            </g>
          ) : (
            // Long flowing back hair
            <path
              d="M 75 110 C 65 170, 70 230, 95 270 C 110 210, 190 210, 205 270 C 230 230, 235 170, 225 110 Z"
              fill="url(#hairGrad)"
            />
          )}
        </g>

        {/* 4. Head & Face Base */}
        <g id="faceBase">
          <path
            d="M 90 120 C 90 70, 210 70, 210 120 C 210 165, 175 208, 150 214 C 125 208, 90 165, 90 120 Z"
            fill={theme.skinColor}
          />

          {/* Ears */}
          <ellipse cx="89" cy="145" rx="6" ry="11" fill={theme.skinColor} />
          <ellipse cx="211" cy="145" rx="6" ry="11" fill={theme.skinColor} />

          {/* Cheeks Blush (Emotive and reacting to Love Mode / touch) */}
          <ellipse cx="114" cy="162" rx="15" ry="9" fill="url(#blushGradient)" />
          <ellipse cx="186" cy="162" rx="15" ry="9" fill="url(#blushGradient)" />
          {/* Cute blush stripes */}
          <g stroke="#ff2e93" strokeWidth="1.2" opacity={emotionStyles.blushOpacity * 0.7}>
            <line x1="108" y1="160" x2="114" y2="164" />
            <line x1="113" y1="159" x2="119" y2="163" />
            <line x1="181" y1="160" x2="187" y2="164" />
            <line x1="186" y1="159" x2="192" y2="163" />
          </g>

          {/* Nose */}
          <path
            d="M 149 156 L 151 161 L 148 162"
            stroke="#dba88d"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* 5. Eyes with Natural Blinking, Pupil Tracking and Saccades */}
        <g id="eyes">
          {/* Eyebrows */}
          <g
            stroke={theme.hairColor}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            style={{
              transform: `translateY(${emotionStyles.eyebrowRaise}px)`,
              transition: 'transform 0.25s ease-out',
            }}
          >
            {/* Left Eyebrow */}
            <path
              d={`M 106 ${124 - emotionStyles.eyebrowAngle} Q 120 ${118 + emotionStyles.eyebrowAngle} 133 124`}
            />
            {/* Right Eyebrow */}
            <path
              d={`M 167 124 Q 180 ${118 + emotionStyles.eyebrowAngle} 194 ${124 - emotionStyles.eyebrowAngle}`}
            />
          </g>

          {/* Left Eye */}
          <g transform="translate(118, 142)">
            {blink ? (
              // Closed eye (happy arch or resting line)
              <path
                d="M -15 2 Q 0 -5 15 2"
                fill="none"
                stroke={theme.hairColor}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            ) : (
              // Open eye with iris, pupil, and high-specular shines
              <g>
                {/* Sclera (White) */}
                <ellipse cx="0" cy="0" rx="14" ry={11 * emotionStyles.eyeScaleY} fill="#ffffff" />
                {/* Top Eyelash / Outline */}
                <path
                  d="M -16 -4 Q 0 -13 16 -3"
                  fill="none"
                  stroke="#1c1917"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Iris (Gaze tracked) */}
                <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
                  <ellipse cx="0" cy="0" rx="9" ry="10" fill="url(#eyeIris)" />
                  {/* Pupil */}
                  <ellipse cx="0" cy="0" rx="4.5" ry="5.5" fill="#09090b" />
                  {/* Light Reflection 1 (Primary Anime Highlight) */}
                  <circle cx="-3" cy="-3.5" r="3.2" fill="#ffffff" />
                  {/* Light Reflection 2 (Secondary Subtle Sparkle) */}
                  <circle cx="3" cy="3" r="1.6" fill="#ffffff" opacity="0.8" />
                  {/* Heart pupil highlight when in romantic state or love mode */}
                  {(userProfile.loveMode || currentEmotion === 'romantic') && (
                    <circle cx="1.5" cy="-1.5" r="1.2" fill="#ff70a6" />
                  )}
                </g>
                {/* Bottom soft lid */}
                <path
                  d="M -12 7 Q 0 12 12 7"
                  fill="none"
                  stroke="#dba88d"
                  strokeWidth="1.2"
                />
              </g>
            )}
          </g>

          {/* Right Eye */}
          <g transform="translate(182, 142)">
            {blink ? (
              <path
                d="M -15 2 Q 0 -5 15 2"
                fill="none"
                stroke={theme.hairColor}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            ) : (
              <g>
                <ellipse cx="0" cy="0" rx="14" ry={11 * emotionStyles.eyeScaleY} fill="#ffffff" />
                <path
                  d="M -16 -3 Q 0 -13 16 -4"
                  fill="none"
                  stroke="#1c1917"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
                  <ellipse cx="0" cy="0" rx="9" ry="10" fill="url(#eyeIris)" />
                  <ellipse cx="0" cy="0" rx="4.5" ry="5.5" fill="#09090b" />
                  <circle cx="-3" cy="-3.5" r="3.2" fill="#ffffff" />
                  <circle cx="3" cy="3" r="1.6" fill="#ffffff" opacity="0.8" />
                  {(userProfile.loveMode || currentEmotion === 'romantic') && (
                    <circle cx="1.5" cy="-1.5" r="1.2" fill="#ff70a6" />
                  )}
                </g>
                <path
                  d="M -12 7 Q 0 12 12 7"
                  fill="none"
                  stroke="#dba88d"
                  strokeWidth="1.2"
                />
              </g>
            )}
          </g>
        </g>

        {/* 6. Mouth / Dynamic Lip Sync with Speech */}
        <g id="mouth" transform="translate(150, 185)">
          {isSpeaking ? (
            // Speaking: dynamic open mouth synced to audio frequency
            <g>
              <path
                d={`M -${speechMouthWidth / 2} 0 Q 0 ${speechMouthOpen * 1.5 + emotionStyles.mouthSmileCurve} ${speechMouthWidth / 2} 0 Q 0 -${speechMouthOpen * 0.3} -${speechMouthWidth / 2} 0 Z`}
                fill="#881337"
                stroke="#4c0519"
                strokeWidth="1.5"
              />
              {/* Tongue */}
              {speechMouthOpen > 8 && (
                <ellipse
                  cx="0"
                  cy={speechMouthOpen * 0.7}
                  rx={speechMouthWidth * 0.3}
                  ry={speechMouthOpen * 0.4}
                  fill="#f43f5e"
                />
              )}
              {/* Teeth */}
              {speechMouthOpen > 5 && (
                <path
                  d={`M -${speechMouthWidth * 0.35} 0 Q 0 3 ${speechMouthWidth * 0.35} 0 Z`}
                  fill="#ffffff"
                />
              )}
            </g>
          ) : (
            // Idle / Emotion-expressive gentle smile
            <path
              d={`M -9 0 Q 0 ${emotionStyles.mouthSmileCurve} 9 0`}
              fill="none"
              stroke="#9f1239"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}
        </g>

        {/* 7. Front Hair (Bangs & Framing Strands) */}
        <g id="frontHair">
          {/* Main bangs */}
          <path
            d="M 85 110 C 95 65, 205 65, 215 110 C 205 130, 195 120, 185 132 C 175 115, 160 135, 150 125 C 140 135, 125 115, 115 132 C 105 120, 95 130, 85 110 Z"
            fill="url(#hairGrad)"
          />

          {/* Left Framing Strand */}
          <path
            d="M 85 105 C 80 145, 85 175, 96 195 C 93 175, 96 145, 98 115 Z"
            fill="url(#hairGrad)"
          />

          {/* Right Framing Strand */}
          <path
            d="M 215 105 C 220 145, 215 175, 204 195 C 207 175, 204 145, 202 115 Z"
            fill="url(#hairGrad)"
          />

          {/* Center cute ahoge / hair highlight ribbon */}
          {theme.style === 'cyberpunk' && (
            <path
              d="M 150 70 Q 155 45 165 48 Q 154 52 152 70 Z"
              fill="#ff2e93"
            />
          )}
        </g>

        {/* 8. Head Accessories (Cyber Mask/Tiara or Flowers) */}
        {theme.style === 'cyberpunk' && (
          <g id="cyberAcc">
            {/* Side Fox/Valkyrie Cyber Mask (Kujou Sara style) */}
            <path
              d="M 205 75 L 245 65 L 230 115 L 195 100 Z"
              fill="#dc2626"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <circle cx="215" cy="85" r="4" fill="#000000" />
            <line x1="205" y1="95" x2="230" y2="80" stroke="#fbbf24" strokeWidth="1.5" />
          </g>
        )}

        {theme.style === 'kimono' && (
          <g id="flowerAcc">
            <circle cx="105" cy="85" r="7" fill="#fbbf24" />
            <circle cx="105" cy="85" r="4" fill="#ef4444" />
          </g>
        )}
      </svg>

      {/* State Indicator Floating Badge */}
      {showStatusBadge && (
        <div className="absolute -bottom-2 px-3 py-1 rounded-full glass-card border border-pink-500/30 text-xs font-medium flex items-center gap-1.5 shadow-lg">
          <span
            className={`w-2 h-2 rounded-full ${
              assistantState === 'SPEAKING'
                ? 'bg-pink-400 animate-ping'
                : assistantState === 'LISTENING'
                ? 'bg-cyan-400 animate-pulse'
                : assistantState === 'THINKING'
                ? 'bg-purple-400 animate-spin'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-200 capitalize">
            {assistantState === 'SPEAKING'
              ? 'Speaking...'
              : assistantState === 'LISTENING'
              ? 'Listening...'
              : assistantState === 'THINKING'
              ? 'Thinking...'
              : assistantState === 'WAITING_FOR_APPROVAL'
              ? 'Approval Needed'
              : `${theme.name} • Online`}
          </span>
        </div>
      )}
    </div>
  );
};
