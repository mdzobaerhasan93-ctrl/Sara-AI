import React, { useEffect, useRef, useState } from 'react';
import { Mic, Activity, Volume2 } from 'lucide-react';

interface AudioFrequencyVisualizerProps {
  isActive: boolean;
  isSpeaking?: boolean;
  barCount?: number;
  className?: string;
}

export const AudioFrequencyVisualizer: React.FC<AudioFrequencyVisualizerProps> = ({
  isActive,
  isSpeaking = false,
  barCount = 24,
  className = '',
}) => {
  const [frequencies, setFrequencies] = useState<number[]>(() =>
    new Array(barCount).fill(12)
  );
  const [dbLevel, setDbLevel] = useState<number>(-60);
  const [hasLiveAudio, setHasLiveAudio] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const peakHoldRef = useRef<number[]>(new Array(barCount).fill(0));
  const wasActiveRef = useRef<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    const stopAudio = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (e) {}
        sourceNodeRef.current = null;
      }
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch (e) {}
        analyserRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (e) {}
        audioContextRef.current = null;
      }
      setHasLiveAudio(false);
      setDbLevel(-60);
    };

    if (!isActive) {
      if (wasActiveRef.current) {
        stopAudio();
        setFrequencies(new Array(barCount).fill(10));
        wasActiveRef.current = false;
      }
      return;
    }

    wasActiveRef.current = true;

    const startAudioCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; // Gives 32 frequency bin slots
        analyser.smoothingTimeConstant = 0.75;
        analyser.minDecibels = -85;
        analyser.maxDecibels = -10;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceNodeRef.current = source;
        setHasLiveAudio(true);

        const bufferLength = analyser.frequencyBinCount; // 32
        const dataArray = new Uint8Array(bufferLength);

        const renderFrame = () => {
          if (isCancelled || !analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate average decibel / volume
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          // Approximate dB from 0-255 scale
          const currentDb = Math.round(
            average > 0 ? -60 + (average / 255) * 54 : -60
          );
          setDbLevel(currentDb);

          // Map the 32 frequency bins down to barCount (e.g. 24)
          const newFreqs: number[] = [];
          for (let b = 0; b < barCount; b++) {
            // Distribute across frequencies with slight emphasis on speech range (mids)
            const index = Math.min(
              bufferLength - 1,
              Math.floor((b / barCount) * bufferLength)
            );
            const rawVal = dataArray[index] || 0;
            // Normalize to percentage 10% to 100%
            const pct = Math.max(8, Math.min(100, Math.round((rawVal / 255) * 100)));
            newFreqs.push(pct);
          }

          setFrequencies(newFreqs);
          animationFrameRef.current = requestAnimationFrame(renderFrame);
        };

        renderFrame();
      } catch (err) {
        console.warn('Microphone stream access for visualizer:', err);
        // Fallback: animated responsive visualizer simulation if getUserMedia is blocked
        setHasLiveAudio(false);
        let phase = 0;
        const fallbackLoop = () => {
          if (isCancelled) return;
          phase += 0.15;
          const simFreqs: number[] = [];
          for (let b = 0; b < barCount; b++) {
            const wave = Math.sin(phase + b * 0.4) * 0.5 + 0.5;
            const height = Math.max(12, Math.round(wave * 70 + Math.random() * 20));
            simFreqs.push(height);
          }
          setFrequencies(simFreqs);
          setDbLevel(Math.round(-35 + Math.sin(phase) * 15));
          animationFrameRef.current = requestAnimationFrame(fallbackLoop);
        };
        fallbackLoop();
      }
    };

    startAudioCapture();

    return () => {
      isCancelled = true;
      stopAudio();
    };
  }, [isActive, barCount]);

  // If speaking (Sara answering), show vibrant synthesized wave
  useEffect(() => {
    if (isSpeaking && !isActive) {
      let phase = 0;
      let frameId: number;
      const synthLoop = () => {
        phase += 0.2;
        const simFreqs: number[] = [];
        for (let b = 0; b < barCount; b++) {
          const h = Math.max(15, Math.round((Math.sin(phase + b * 0.5) * 0.5 + 0.5) * 85));
          simFreqs.push(h);
        }
        setFrequencies(simFreqs);
        setDbLevel(-22);
        frameId = requestAnimationFrame(synthLoop);
      };
      synthLoop();
      return () => cancelAnimationFrame(frameId);
    }
  }, [isSpeaking, isActive, barCount]);

  const isDetectingVoice = dbLevel > -48;

  return (
    <div
      className={`w-full max-w-sm mx-auto p-3 rounded-2xl glass-card border border-pink-500/30 bg-slate-950/70 shadow-[0_0_25px_rgba(255,46,147,0.15)] space-y-2 ${className}`}
    >
      {/* Top Status & Live Meter */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isActive ? 'bg-cyan-400' : 'bg-pink-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isActive ? 'bg-cyan-500' : 'bg-pink-500'
              }`}
            />
          </span>
          <span className={isActive ? 'text-cyan-300' : 'text-pink-300'}>
            {isActive
              ? isDetectingVoice
                ? 'VOICE INPUT ACTIVE'
                : 'MIC LISTENING...'
              : isSpeaking
              ? 'SARA VOICE OUTPUT'
              : 'IDLE AUDIO'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="text-cyan-300 font-bold">{dbLevel} dB</span>
        </div>
      </div>

      {/* Dynamic Audio Frequency Equalizer Bars */}
      <div className="h-14 flex items-end justify-between gap-1 px-1 bg-slate-900/80 rounded-xl p-1.5 border border-slate-800 relative overflow-hidden">
        {/* Subtle background ambient pulse glow */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-pink-500/10 via-cyan-500/5 to-transparent pointer-events-none transition-opacity"
          style={{ opacity: isDetectingVoice ? 0.8 : 0.2 }}
        />

        {frequencies.map((height, i) => {
          // Color transition based on frequency position and amplitude
          const isCenter = i >= barCount * 0.3 && i <= barCount * 0.7;
          const bgGradient =
            height > 60
              ? 'from-pink-500 via-rose-400 to-purple-500'
              : isCenter
              ? 'from-cyan-500 via-teal-400 to-blue-500'
              : 'from-blue-500 via-indigo-500 to-pink-500';

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end h-full z-10"
            >
              {/* Peak cap */}
              <div
                className="w-full h-0.5 rounded-full bg-white opacity-80 mb-0.5 transition-all duration-75"
                style={{
                  boxShadow: height > 50 ? '0 0 6px rgba(255, 46, 147, 0.8)' : 'none',
                }}
              />
              {/* Frequency bar */}
              <div
                className={`w-full rounded-t-md bg-gradient-to-t ${bgGradient} transition-all duration-75 shadow-sm`}
                style={{
                  height: `${height}%`,
                  boxShadow:
                    height > 40
                      ? '0 0 8px rgba(0, 242, 254, 0.4)'
                      : 'none',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Frequency Labels */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono px-1">
        <span>60Hz (Bass)</span>
        <span>1kHz (Voice Mids)</span>
        <span>12kHz (Treble)</span>
      </div>
    </div>
  );
};
