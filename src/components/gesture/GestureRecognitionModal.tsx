import React, { useEffect, useRef, useState } from 'react';
import { useSara } from '../../context/SaraContext';
import { X, Camera, Sparkles, Heart, Hand, Zap, Video, CheckCircle2 } from 'lucide-react';

interface GestureRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GestureRecognitionModal: React.FC<GestureRecognitionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { triggerGestureAction, gestureMappings } = useSara();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && cameraActive) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 480 } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Webcam access error:', err);
          setSimulationMode(true);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, cameraActive]);

  if (!isOpen) return null;

  const handleSimulateGesture = (gestureKey: string) => {
    setDetectedGesture(gestureKey);
    triggerGestureAction(gestureKey);
    setTimeout(() => {
      setDetectedGesture(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl glass-card border border-pink-500/40 p-6 space-y-5 shadow-[0_0_40px_rgba(255,46,147,0.3)] relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-pink-600/30 border border-pink-500/50 flex items-center justify-center text-pink-400">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">MediaPipe Gesture AI</h3>
              <p className="text-xs text-slate-400">Interact with Sara using camera hand gestures</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Feed / Simulation Canvas */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-pink-500/35 h-64 flex flex-col items-center justify-center">
          {cameraActive && !simulationMode ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-purple-950/40 to-slate-950">
              <div className="w-16 h-16 rounded-3xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400 mb-3 animate-pulse">
                <Hand className="w-8 h-8" />
              </div>
              <p className="text-xs font-bold text-slate-200">MediaPipe Hand Tracker Ready</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Use the gesture buttons below to simulate hand gestures (Waving, Heart, Thumbs Up, Peace) instantly!
              </p>
            </div>
          )}

          {/* Detected Gesture Feedback Overlay */}
          {detectedGesture && (
            <div className="absolute inset-0 bg-pink-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center animate-in zoom-in duration-200">
              <CheckCircle2 className="w-12 h-12 text-pink-400 animate-bounce mb-2" />
              <p className="text-lg font-bold text-white capitalize">Gesture Detected: {detectedGesture}!</p>
              <p className="text-xs text-pink-200 mt-1">Executing bound automation action...</p>
            </div>
          )}
        </div>

        {/* Toggle Camera / Simulation */}
        <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-semibold text-slate-200">Live Camera Tracking</span>
          </div>
          <button
            onClick={() => setCameraActive(!cameraActive)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              cameraActive
                ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(255,46,147,0.4)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cameraActive ? 'Disable Camera' : 'Enable Camera'}
          </button>
        </div>

        {/* Gesture Simulation & Test Pad */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            • TEST GESTURES & AUTOMATION BINDINGS •
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'wave', label: 'Waving Hand 👋', binding: gestureMappings['wave'] || 'open_chat' },
              { key: 'heart', label: 'Heart Hands 💖', binding: gestureMappings['heart'] || 'romantic_mode' },
              { key: 'thumbs_up', label: 'Thumbs Up 👍', binding: gestureMappings['thumbs_up'] || 'toggle_lights' },
              { key: 'peace', label: 'Peace Sign ✌️', binding: gestureMappings['peace'] || 'open_wardrobe' },
            ].map((g) => (
              <button
                key={g.key}
                onClick={() => handleSimulateGesture(g.key)}
                className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-pink-500/50 flex flex-col items-start text-left transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-pink-300">{g.label}</span>
                  <Zap className="w-3 h-3 text-pink-400" />
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                  Automation: {g.binding}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
